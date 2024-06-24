import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, NgForm, FormArray, Validators, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommonModuleModule } from './../../common-module/common-module.module';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ChangeDateFormatService } from '../../common-module/shared-services/change-date-format.service'; // Import date format method from common service
import { DatatableService } from './../../common-module/shared-services/datatable.service'
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HmsDataServiceService } from './../../common-module/shared-services/hms-data-api/hms-data-service.service';
import { isComponentView } from '@angular/core/src/view/util';
import { ExDialog } from "../../common-module/shared-component/ngx-dialog/dialog.module";

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css'],
  providers: [DatatableService, ChangeDateFormatService, TranslateService, ToastrService]
})

export class FilesComponent implements OnInit {
  page: number = 1;
  stickToPage: boolean = false;
  showAll: boolean = true;
  fileId: any;
  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ToastrService: ToastrService,
    private exDialog: ExDialog
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.fileId = params.id;
    });
  }

  onAfterLoad(event: any) {
  }

  onProgress(event: any) {
    // Do anything with progress data. For example progress indicator
    this.isLoading = true;
  }

  switchSticky() {
    this.stickToPage = !this.stickToPage;
  }

  switchShowAll() {
    this.showAll = !this.showAll;
  }

  setPage(num: number) {
    this.page += num;
  }

  done() {
    this.exDialog.openConfirm(('Are you sure to do it?')).subscribe((value) => {
      if (value) {
        this.ToastrService.success("API Calling...");
      } else {
        this.ToastrService.error("Something Went Wrong!!");
      }
    });
  }

}