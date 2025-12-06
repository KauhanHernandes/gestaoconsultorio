import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonthlyReport, WEEKDAYS, MONTHS } from '../types';

export const generatePDF = (reports: MonthlyReport[], month: number, year: number) => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let yPosition = margin;

    const drawHeader = () => {
      doc.setFillColor(46, 125, 50);
      doc.rect(0, 0, pageWidth, 45, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('NUTRIÇÃO INFANTIL', pageWidth / 2, 12, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Relatório de Consultas Mensais', pageWidth / 2, 24, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text(`${MONTHS[month - 1]} de ${year}`, pageWidth / 2, 33, { align: 'center' });
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 40, { align: 'center' });

      return 52;
    };

    const drawFooter = () => {
      const footerY = pageHeight - 10;
      const pageNum = doc.internal.getCurrentPageIndex() + 1;

      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.setDrawColor(46, 125, 50);
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

      doc.text('© 2025 Nutricionista Maria Evellyn - Todos os direitos reservados - Desenvolvido por Kauhan Hernandes', pageWidth / 2, footerY - 2, { align: 'center' });
      doc.text(`Página ${pageNum}`, pageWidth - margin - 2, footerY - 2, { align: 'right' });
    };

    yPosition = drawHeader();

    const totalSessions = reports.reduce((sum, r) => sum + r.totalSessions, 0);
    const totalRevenue = reports.reduce((sum, r) => sum + r.totalValue, 0);
    const totalPaid = reports.reduce((sum, r) => sum + r.paidSessions, 0);
    const totalUnpaid = reports.reduce((sum, r) => sum + r.unpaidSessions, 0);
    const paidRevenue = reports.reduce((sum, r) => {
      return sum + r.appointments.filter(apt => apt.paid).reduce((s, apt) => s + Number(apt.value), 0);
    }, 0);
    const unpaidRevenue = totalRevenue - paidRevenue;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO GERAL', margin, yPosition);
    yPosition += 8;

    const summaryData = [
      ['Período', `${MONTHS[month - 1]} de ${year}`],
      ['Total de Pacientes', reports.length.toString()],
      ['Total de Consultas', totalSessions.toString()],
      ['Consultas Pagas', `${totalPaid} (R$ ${paidRevenue.toFixed(2)})`],
      ['Consultas Pendentes', `${totalUnpaid} (R$ ${unpaidRevenue.toFixed(2)})`],
      ['Receita Total', `R$ ${totalRevenue.toFixed(2)}`],
      ['Taxa de Cobrança', `${totalSessions > 0 ? ((totalPaid / totalSessions) * 100).toFixed(1) : '0'}%`]
    ];

    autoTable(doc, {
      startY: yPosition,
      body: summaryData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3.5,
        textColor: [0, 0, 0],
        lineColor: [46, 125, 50],
        lineWidth: 0.5
      },
      bodyStyles: {
        alternateRowStyles: {
          fillColor: [240, 248, 245]
        }
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 65, halign: 'left' },
        1: { halign: 'right', cellWidth: 'auto' }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    reports.forEach((report, index) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = margin;
        drawFooter();
      }

      doc.setFillColor(70, 150, 80);
      doc.rect(margin - 2, yPosition - 6, pageWidth - 2 * (margin - 2), 10, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const patientName = report.patient.name.length > 50
        ? report.patient.name.substring(0, 47) + '...'
        : report.patient.name;
      doc.text(`${index + 1}. ${patientName}`, margin + 2, yPosition);

    yPosition += 12;

    const patientInfo = [
      ['Idade', `${report.patient.age} anos`, 'Dia da Semana', WEEKDAYS[report.patient.weekday]],
      ['Valor por Consulta', `R$ ${report.patient.session_value.toFixed(2)}`, 'Telefone', report.patient.phone || '—']
    ];

    autoTable(doc, {
      startY: yPosition,
      body: patientInfo,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 2,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.3
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { fontStyle: 'bold', cellWidth: 30 },
        3: { cellWidth: 'auto' }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 3;

    if (report.appointments.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(46, 125, 50);
      doc.text('Consultas do Mês:', margin, yPosition);
      yPosition += 5;

      const appointmentRows = report.appointments.map(apt => {
        const date = new Date(apt.appointment_date + 'T00:00:00');
        return [
          date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }),
          `R$ ${apt.value.toFixed(2)}`,
          apt.paid ? '✓ Pago' : '⏱ Pendente'
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Data', 'Valor', 'Status']],
        body: appointmentRows,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.3
        },
        headStyles: {
          fillColor: [46, 125, 50],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248]
        },
        columnStyles: {
          0: { cellWidth: 40, halign: 'center' },
          1: { cellWidth: 30, halign: 'right' },
          2: { cellWidth: 40, halign: 'center' }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const status = data.cell.text[0];
            if (status.includes('Pago')) {
              data.cell.styles.textColor = [46, 125, 50];
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = [200, 150, 0];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 3;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 150, 80);
    doc.text('Resumo:', margin, yPosition);
    yPosition += 4;

    const summaryRows = [
      ['Total de Consultas', report.totalSessions.toString(), 'Consultas Pagas', report.paidSessions.toString()],
      ['Consultas Pendentes', report.unpaidSessions.toString(), 'Valor Total', `R$ ${report.totalValue.toFixed(2)}`]
    ];

    autoTable(doc, {
      startY: yPosition,
      body: summaryRows,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [0, 0, 0],
        lineColor: [46, 125, 50],
        lineWidth: 0.3
      },
      bodyStyles: {
        fillColor: [245, 255, 245]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 30 },
        1: { halign: 'right', cellWidth: 25 },
        2: { fontStyle: 'bold', cellWidth: 30 },
        3: { halign: 'right', cellWidth: 'auto' }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;

    if (index < reports.length - 1 && yPosition < pageHeight - 50) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineDash([2, 2]);
      doc.line(margin, yPosition - 4, pageWidth - margin, yPosition - 4);
      doc.setLineDash([]);
      yPosition += 2;
    }
  });

    const totalPages = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawFooter();
    }

    const fileName = reports.length === 1
      ? `relatorio_${reports[0].patient.name.replace(/\s+/g, '_')}_${month}_${year}.pdf`
      : `relatorio_completo_${month}_${year}.pdf`;

    doc.save(fileName);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar o PDF. Tente novamente.');
  }
};
