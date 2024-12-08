import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Ensure the VFS is set correctly
//pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfMake.vfs;
//pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const generatePDF = (metrics, bom, serialNumber) => {

    // Validate inputs
    if (!metrics || typeof metrics !== 'object') {
        console.error('Invalid or missing metrics object');
        return;
    }

    // Initialize metrics with default values if undefined
    const safeMetrics = {
        totalRawCapacity: metrics.totalRawCapacity || 0,
        totalSsdCapacity: metrics.totalSsdCapacity || 0,
        totalHddCapacity: metrics.totalHddCapacity || 0,
        ratioSsdHdd: metrics.ratioSsdHdd || 0,
        totalIops: metrics.totalIops || 0,
        totalInodes: metrics.totalInodes || 0,
        totalMetadata: metrics.totalMetadata || 0,
        totalTransferRate: metrics.totalTransferRate || 0,
        totalSolutionCost: metrics.totalSolutionCost || 0
    };

    // Generate a unique file name 
        const generateFileName = (serialNumber) => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}${month}${day}`;
        return `VDURA_V5000_Quotation_${formattedDate}.pdf`;
    };

     const fileName = generateFileName(serialNumber);

      const docDefinition = {
      content: [
        { text: 'VDURA V5000 Quotation', style: 'header' },
        { text: `Generated on: ${new Date().toLocaleDateString()}`, style: 'subheader' },
        { text: 'System Attributes', style: 'subheader' },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              ['RAW Capacity', 'SSD Capacity', 'HDD Capacity'],
              [
                `${metrics.totalRawCapacity.toLocaleString(undefined, { maximumFractionDigits: 0 })} TB`,
                `${metrics.totalSsdCapacity.toLocaleString(undefined, { maximumFractionDigits: 0 })} TB`,
                `${metrics.totalHddCapacity.toLocaleString(undefined, { maximumFractionDigits: 0 })} TB`
              ],
              ['SSD Content', 'Total IOPS', 'iNodes supported'],
              [
                `${(metrics.ratioSsdHdd * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })} %`,
                `${metrics.totalIops.toLocaleString(undefined, { maximumFractionDigits: 1 })} M/s`,
                `${metrics.totalInodes.toLocaleString(undefined, { maximumFractionDigits: 0 })} M`
              ],
              ['Metadata Creates/Deletes', 'Sustained Throughput', 'Solution Price'],
              [
                `${metrics.totalMetadata.toLocaleString(undefined, { maximumFractionDigits: 1 })} k/s`,
                `${(metrics.totalTransferRate || 0).toFixed(1)} GB/s`,
                `$${Number(metrics.totalSolutionCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              ]
            ]
          }
        },
        { text: 'Bill of Materials', style: 'subheader' },
        {
          table: {
            widths: ['10%', '45%', '10%', '5%', '8%', '5%', '8%', '10%'],
            body: [
              ['P/N', 'Description', 'List Price', 'Discount', 'Unit Price', 'Months', 'Quantity', 'Extended Price'],
              ...bom.map(item => [
                item.partNumber || '',
                item.item || '',
                item.unitCost !== undefined ? `$${Number(item.unitCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '',
                item.discount || '',
                item.unitCost !== undefined ? `$${Number(item.unitCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '',
                item.months || '',
                item.quantity || '',
                item.totalCost !== undefined ? `$${Number(item.totalCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ''
              ])
            ]
          },
          style: 'smallText' // Apply the smallText style to the BOM table
        }
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 14,
          color: 'black'
        },
        smallText: {
        fontSize: 8, // Define a smaller font size for the BOM table
        alignment: 'right'
          }
        }
    };

    pdfMake.createPdf(docDefinition).download(fileName);
   
} 

