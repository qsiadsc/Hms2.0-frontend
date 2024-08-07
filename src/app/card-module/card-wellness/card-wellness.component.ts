import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'card-wellness',
  templateUrl: './card-wellness.component.html',
  styleUrls: ['./card-wellness.component.css']
})
export class CardWellnessComponent implements OnInit {


  editMode: boolean = false;
  wellness: number= 30;
  minWellness: number ;
  maxWellness: number;
  sliderValue: number = 100-this.wellness; 
  isFlexibleAccount: boolean= true;
  @ViewChild('mySlider') slider: ElementRef;

  constructor() { }

  ngOnInit() {
    this.updateSliderBackground();
  }

  onSliderInput() {
    this.updateSliderBackground();
  }

  updateSliderBackground() {
    const sliderElement = this.slider.nativeElement;
    const value = this.sliderValue;
    sliderElement.style.background = `linear-gradient(to right, #FF5733 ${value}%, #f7dba4 ${value}%)`;

  }

  enableSlider(){

    const sliderElement = this.slider.nativeElement;

    sliderElement.disabled = false; 
    sliderElement.style.opacity=1;
    this.editMode= true;
  }

  disableSlider(){

    const sliderElement = this.slider.nativeElement;
    this.wellness=100-sliderElement.value;
    sliderElement.disabled = true; 
    sliderElement.style.opacity=0.6;
    this.editMode= false;
  }

  cancelEdit(){
    const sliderElement = this.slider.nativeElement;
    this.sliderValue=100-this.wellness;
    sliderElement.disabled = true; 
    sliderElement.style.opacity=0.6;
    this.editMode= false;
    sliderElement.style.background = `linear-gradient(to right, #FF5733 ${this.sliderValue}%, #f7dba4 ${this.sliderValue}%)`;
  }

}
