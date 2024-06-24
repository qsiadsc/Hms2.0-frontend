import { Component, OnInit,Input,ViewChild, OnChanges, SimpleChange } from '@angular/core';
import { ClaimItemDentalComponent } from './claim-item-dental/claim-item-dental.component';
import { ClaimItemVisionComponent } from './claim-item-vision/claim-item-vision.component'; 
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ClaimService } from '../claim.service'
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-claim-item',
  templateUrl: './claim-item.component.html',
  styleUrls: ['./claim-item.component.css'],
})
export class ClaimItemComponent implements OnInit,OnChanges {
  claimItemDenatlMode: any;
  @Input() ClaimId: any;
  @Input() CHRecievedDate: any;
  @Input() DisciplineKey: any;
  @Input() addMode: boolean;
  @Input() viewMode: boolean;
  @Input() editMode: boolean;
  @Input() copyMode: boolean;
  @Input() claimItemAuth: any;
  @Input() reviewer: boolean;
  @Input() claimStatus: any;
  @Input() claimRefered: boolean;
  @Input() preAuthReverseClaim: boolean;
  @Input() cardBusinessTypeKey: any;
  @Input()  resetForm : any;
  @Input() claimTypeKey:any
  @ViewChild(ClaimItemDentalComponent) claimItemDentalComponent:ClaimItemDentalComponent;
  @ViewChild(ClaimItemVisionComponent) claimItemVisionComponent:ClaimItemVisionComponent;
  claimItemRequest=[]
  hasCrdHolder: boolean;
  cardholderKey: any;
  claimItems=[]
  lockClaimItemStr: string;
  isDiscipline: Subscription
  isDiscFromDash: Subscription
  isMobilClaimItem: Subscription
  constructor( private route: ActivatedRoute,
    private claimService: ClaimService,
    private toastrService: ToastrService) { 
    this.isDiscipline = claimService.getDisciplineKey.subscribe(value => {
      this.claimItemRequest = [];
      this.DisciplineKey = value
    })

    this.isDiscFromDash = claimService.getDisciplineMobile.subscribe(value => {
      this.claimItemRequest = [];
      this.DisciplineKey = value.disciplineKey;
      this.hasCrdHolder=true;
    })

    claimService.hasCardHolder.subscribe(value => {
      value ? this.hasCrdHolder = true : this.hasCrdHolder = false
    })
    claimService.addNewClaimItem.subscribe(value => {
      if(value == true && this.hasCrdHolder == true && !this.viewMode && !this.editMode){
        this.AddNew();
      }
    })
    claimService.claimItemMode.subscribe(value => {
      this.claimItemDenatlMode = value;
    })
    this.claimService.cardHolderKey.subscribe(val => {
      this.cardholderKey = val;

    })
     /* Lock Processor Functionality*/
     claimService.getLockedMessage.subscribe(val => {
      this.lockClaimItemStr = val
    }) 
    this.isMobilClaimItem = this.claimService.mobilClaimItem.subscribe(data=>{
      this.AddNewMobile(data)
    })
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    
    let log: string[] = [];
    for (let propName in changes) {
      let changedProp = changes[propName];
      if(propName == "resetForm" && !changedProp.firstChange){
        this.DisciplineKey = 1;
        this.hasCrdHolder = false;
        this.claimItemDenatlMode = null;
        this.claimItemRequest = [];
      }
    }
  
  }

  ngOnInit() {
  }

  ngAfterViewInit(){
  }

  OnClaimItemSave(evt)
  {    
    this.claimItemRequest = evt;    
  }

  AddNew(){ 
    if (this.lockClaimItemStr != "" && this.lockClaimItemStr != undefined) {
      this.toastrService.error(this.lockClaimItemStr)
      return
    }
        $("#btnEditClaim").addClass('addNewEditClaim');
        $("#btnEditClaim").click();
        this.DisciplineKey=='1'? this.claimItemDentalComponent.AddNew(): this.claimItemVisionComponent.AddNew();

  }
  AddNewMobile(data){ 
    if (this.lockClaimItemStr != "" && this.lockClaimItemStr != undefined) {
      this.toastrService.error(this.lockClaimItemStr)
      return
    }
    if (data) {
      if (data.licenseNumber) {
        $("#btnEditClaim").addClass('addNewEditClaim');
        $("#btnEditClaim").click();
        this.DisciplineKey=='1'? this.claimItemDentalComponent.AddNewMobile(data): this.claimItemVisionComponent.AddNewMobile(data);   
      }
    }
  }
  editClaimIteam(){
   if(this.DisciplineKey=='1'){
      this.claimItemDentalComponent.EditInfo(0,this.claimItemDentalComponent.arrClaimItems[0])
      this.claimItems = this.claimItemDentalComponent.arrClaimItems
   } else {
      this.claimItemVisionComponent.EditInfo(0,this.claimItemVisionComponent.arrClaimItems[0])
      this.claimItems = this.claimItemVisionComponent.arrClaimItems
   }
  }

  enableAdj(){
    let promise = new Promise((resolve, reject) => {
      if(this.DisciplineKey=='1'){
        if(this.claimItemDentalComponent.editMode){
          let claimIndex = this.claimItemDentalComponent.claimItemIndex;
          let claimDataRow = this.claimItemDentalComponent.arrClaimItems[claimIndex];
          this.claimItemDentalComponent.UpdateInfo(claimIndex,claimDataRow).then(row=>{
            resolve();
          });
        }else{
          if(this.claimItemDentalComponent.addMode){
            this.claimItemDentalComponent.SaveInfo(4).then(row=>{
              resolve();
            });
          }else{
            resolve();
          }
        }
      }else{
        if(this.claimItemVisionComponent.editMode){
          let claimVisionIndex = this.claimItemVisionComponent.claimItemIndex;
          let claimVisionDataRow = this.claimItemVisionComponent.arrClaimItems[claimVisionIndex];
          this.claimItemVisionComponent.UpdateInfo(claimVisionIndex,claimVisionDataRow).then(row=>{
            resolve();
          });
        }else{
          if(this.claimItemVisionComponent.addMode){
            this.claimItemVisionComponent.SaveInfo(4).then(row=>{
              resolve();
            });
          }else{
            resolve();
          }
        }
      }
    });
    return promise;
  }

  reloadClaimItems(){
    let promise = new Promise((resolve, reject) => {
      if(this.DisciplineKey=='1'){
        this.claimItemDentalComponent.getClaimItems(); 
        resolve();
      }else{
        this.claimItemVisionComponent.getClaimItems(); 
        resolve();
      }
    });
    return promise;
  }

  ngOnDestroy() {
    if (this.isDiscFromDash) {
      this.isDiscFromDash.unsubscribe()
    }
    if (this.isDiscipline) {
      this.isDiscipline.unsubscribe()
    }
    if (this.isMobilClaimItem) {
      this.isMobilClaimItem.unsubscribe()
    }
  }

}

