#Created By: Tarun Chhabra

#Introduction:

The ng-idle module is created for LoggedIn User Idle state handling. For exaple if user is loggedIn  and system is in idle state. Then after perticular time (5 minute) we will intemate user he is going to log out after 5 second. We place this functionality placed at path app/shared/main-header

#How To Use:

Run following command

npm install @ng-idle/keepalive --save

1) Import Files on Module.ts 

import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';  and add refference in 

imports: [
    NgIdleKeepaliveModule.forRoot(),
  ],

1) Import Files on Component

import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';


In Constructor 

private idle: Idle, private keepalive: Keepalive,private exDialog: ExDialog
   
 LogOffScreen()
  {
   // sets an idle timeout of 5 seconds, for testing purposes.
  this.idle.setIdle(5);
  // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
  this.idle.setTimeout(5);
  // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
  this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.idle.onIdleEnd.subscribe(() => this.idleState = 'No longer idle.');
  this.idle.onTimeout.subscribe(() => {
    this.idleState = 'Timed out!';
    this.timedOut = true;
    this.router.navigate(['quikcardlogin']);
  });
  this.idle.onIdleStart.subscribe(() => this.idleState = 'You\'ve gone idle!');
   
  this.idle.onTimeoutWarning.subscribe((countdown =>{
    this.idleState = 'You will time out in ' + countdown + ' seconds!'
        if(countdown == 5)
        {
         this.exDialog.openMessage(this.idleState);
        }
        else if(countdown == 1)
        {

        }
  }));
   
     // sets the ping interval to 15 seconds
  this.keepalive.interval(5);
     this.keepalive.onPing.subscribe(() => this.lastPing = new Date());
     this.reset();
  }

#Used On: 

Components:

shared/main-header






