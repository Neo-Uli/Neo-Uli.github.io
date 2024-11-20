function generatePDF() {
    // Selecciona el formulario
    var element = document.getElementById('cotizacion');

    // Usa html2pdf para convertir el contenido a PDF
    html2pdf()
        .from(element)
        .set({
            margin: 1,
            filename: 'formulario.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait' }
        })
        .save();
}
