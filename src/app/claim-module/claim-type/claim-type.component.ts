import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-claim-type',
  templateUrl: './claim-type.component.html',
  styleUrls: ['./claim-type.component.css']
})
export class ClaimTypeComponent implements OnInit {

  constructor() { }

  ClaimTypeFormGroup:FormGroup;
  claimType;
  ngOnInit() {
  }

}
