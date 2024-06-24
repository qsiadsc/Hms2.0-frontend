import { Component, OnInit } from '@angular/core';
import { drawDOM, exportPDF, DrawOptions, Group } from '@progress/kendo-drawing';
import { saveAs } from '@progress/kendo-file-saver';
@Component({
  selector: 'app-review-report',
  templateUrl: './review-report.component.html',
  styleUrls: ['./review-report.component.css']
})
export class ReviewReportComponent implements OnInit {
  isFileContent:boolean = false;
  constructor() { }

  ngOnInit() {
  }

  exportLetter(element: HTMLElement, options?: DrawOptions) {
    this.isFileContent=true;
    drawDOM(element, options).then((group: Group) => {
      this.isFileContent=false;;
        return exportPDF(group);
    }).then((dataUri) => {
        saveAs(dataUri, 'ExportLetter.pdf');
    });
  }

}
