import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { slideInDownAnimation } from './animations';
// tslint:disable:import-spacing


@Component({
  templateUrl: './iko-message.component.html',
  styles: [':host { position: relative; bottom: 10%; }'],
  animations: [slideInDownAnimation]
})
export class IkoMessageComponent implements OnInit {

  @HostBinding('@popAnimation') routeAnimation = true;
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.position') position = 'absolute';

  details: string;
  message: string;
  sending: boolean;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.sending = false;
  }
  send() {
    this.sending = true;
    this.details = `En fait c'est pour du faux...`;


    setTimeout(() => {
      this.sending = false;
      this.closePopup();
    }, 1000);
  }

  cancel() {
    this.closePopup();
  }

  closePopup() {
    // si on passe null a un named outlet ,ben il est vexé et il disparaît
    this.router.navigate([{ outlets: { popup: null } }]);
  }
}
