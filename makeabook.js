import { PageSizes, PDFDocument, degrees } from 'pdf-lib'
import * as fs from 'fs';

function createPageArrays(max) {
    let lefts = [];
    let rights = [];
    let half = max/2;
    for(let i = 0; i < half; i++){
        if(i%2){ //backsides of pages
            lefts.push(i);
            rights.push(max - 1 - i);
        }
        else{ //frontsides of pages
            lefts.push(max - 1 - i);
            rights.push(i);
        }
    }

    return {lefts, rights};
}

function measurePage(page, margin = 10){
    const { width, height } = page.getSize();
    const scalevar = (width/595.28 > height/841.89) ? width : height;
    const scale = 420.9/(width + 2*margin);

    const x = 595.28 - margin;
    const lefty = margin;
    const righty = 420.9 + margin;

    return {x, lefty, righty, scale}
}

async function copyPages(fileName) {


const firstDonorPdfBytes =  fs.readFileSync(fileName);

const firstDonorPdfDoc = await PDFDocument.load(firstDonorPdfBytes);

let numPages = firstDonorPdfDoc.getPageCount()
if(!(numPages % 2)) {
    firstDonorPdfDoc.addPage().drawText('bweh');
    numPages += 1;
}

var lefts, rights;
const pageArrays = createPageArrays(numPages);
lefts = pageArrays.lefts;
rights = pageArrays.rights;

const pages = firstDonorPdfDoc.getPages();
const leftPages = [];
const rightPages = [];

lefts.forEach(element => {
    leftPages.push(pages[element]);
});

rights.forEach(element => {
    rightPages.push(pages[element]);
});

const mergedPdf = await PDFDocument.create();

const embeddedLeft = await mergedPdf.embedPages(leftPages);
const embeddedRight = await mergedPdf.embedPages(rightPages);

/*

Before we get to arranging the pages, let's talk the coordinate system.
X and Y axes are based on the un-rotated page, and start at bottom left.
After rotation, the origin is at the top right.

Pages are anchored at their bottom left, which is also top right when anchored.
A4 size: [595.28, 841.89]

*/

embeddedLeft.forEach((element, i) => {
    let dims = measurePage(leftPages[i]);
   let page = mergedPdf.addPage(PageSizes.A4);
   page.drawPage(element, {
    x: dims.x, //maxwidth
    y: dims.lefty,
    xScale: dims.scale,
    yScale: dims.scale,
    rotate: degrees(90)
   })
});

embeddedRight.forEach((element, i) => {
    let dims = measurePage(rightPages[i]);
    let page = mergedPdf.getPage(i);
    page.drawPage(element, {
     x: dims.x,
     y: dims.righty, 
     xScale: dims.scale,
     yScale: dims.scale,
     rotate: degrees(90)
    })
});

return mergedPdf;

// Insert the second copied page to index 0, so it will be the
// first page in `pdfDoc`
//pdfDoc.insertPage(0, secondDonorPage)

// Serialize the PDFDocument to bytes (a Uint8Array)
//const pdfBytes = await pdfDoc.save()

// For example, `pdfBytes` can be:
//   • Written to a file in Node
//   • Downloaded from the browser
//   • Rendered in an <iframe>

}

async function runPrinter(inFile, outFile){
    const pdf = await copyPages(inFile);

    const pdfBytes = await pdf.save();

    fs.writeFileSync(outFile, pdfBytes);
    console.log(`PDF file written to: ${outFile}`);
}

runPrinter('input filename',
'output filename'
);


