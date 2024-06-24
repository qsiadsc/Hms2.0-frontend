import { Component, OnInit } from '@angular/core';
import { Constants } from '../../common-module/Constants'

@Component({
  selector: 'app-main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.css']
})
export class MainFooterComponent implements OnInit {
  istestServer = Constants.testServer
  constructor() { }

  ngOnInit() {     
}

}