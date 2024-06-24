import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.css']
})

export class NotfoundComponent implements OnInit {
  id: any;
  @Input() loggedin: boolean
  constructor(private router: Router) {
    this.id = localStorage.getItem('id');
   // console.log(this.id)
    if (this.id != 0) {
      this.loggedin = true
    }
    else {
      this.loggedin = false;
    }
  }

  ngOnInit() {
  }

}