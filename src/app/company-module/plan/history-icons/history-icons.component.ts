import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-history-icons',
  templateUrl: './history-icons.component.html',
  styleUrls: ['./history-icons.component.css']
})
export class HistoryIconsComponent implements OnInit {

  @Input() id: string;
  @Input() title: string;
  @Input() class: string;
  
  constructor() { }

  ngOnInit() {
  }

}
