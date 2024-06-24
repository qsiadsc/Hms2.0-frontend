import { Injectable, EventEmitter } from '@angular/core';
@Injectable()
export class ReviewAppService {
  reviewSearchData: any;
  selectedReviewStatus: any
  selectedClaimType: any
  getReviewSearchData(value: any, selectedReviewStatus, selectedClaimType): any {
    this.reviewSearchData = value
    this.selectedReviewStatus = selectedReviewStatus
    this.selectedClaimType = selectedClaimType
  }
  constructor() { }
  public getTestKey = new EventEmitter();
  public openLetter = new EventEmitter();
}
