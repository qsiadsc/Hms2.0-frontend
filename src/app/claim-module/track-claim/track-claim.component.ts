import { Component, OnInit, Input } from '@angular/core';
import { CurrentUserService } from '../../common-module/shared-services/hms-data-api/current-user.service';

@Component({
  selector: 'app-track-claim',
  templateUrl: './track-claim.component.html',
  styleUrls: ['./track-claim.component.css']
})
export class TrackClaimComponent implements OnInit {

  @Input() trackStatusList: any[];
  @Input() recordLength: any;
  @Input() message: any;
  @Input() refNumber: any;
  @Input() claimId: any;

  constructor(private currentUserService: CurrentUserService) { }

  ngOnInit() {
  }

  redirectToClaim(data){
    
    
    if(data.referTo == "OPERATOR"){
      localStorage.setItem('applicationRoleKey', '1')
      this.currentUserService.applicationRoleKey = 1
      window.open("/claim/view/" + this.claimId + "/type/" + 1, "_blank");
    }
    else 
    if(data.referTo == "CONSULTANT"){
      localStorage.setItem('applicationRoleKey', '2')
      this.currentUserService.applicationRoleKey = 2
      window.open("/claim/view/" + this.claimId + "/type/" + 1 + '/reviewer/' + data['reviewKey'], "_blank");
    }
    else
    if(data.referTo == "REVIEWER"){
      localStorage.setItem('applicationRoleKey', '5')
      this.currentUserService.applicationRoleKey = 5
      window.open("/claim/view/" + this.claimId + "/type/" + 1 + '/reviewer/' + data['reviewKey'], "_blank");
    }
  }

}
