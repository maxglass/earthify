import {Component, OnInit} from '@angular/core';
import {SharedService} from "./shared.service";
declare var $: any;
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    constructor(private data: SharedService) {

    }
    ngOnInit(): void {
        setTimeout(() => {
            $('body').prepend(`<video class="bg-video" id="d" data-autoplay="true"
                data-aspect-ratio="hd"
                data-loop="true"
                data-volume="0"
                data-role="video-player"
                data-show-play="false"
                data-show-stop="false"
                data-show-full="false"
                data-show-stream="false"
                data-show-volume="false"
                data-src="${SharedService.server + 'getEarthVideo'}" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    min-width: 100%;
                    min-height: 100%;
                    width: auto;
                    height: auto;
                    transform: translate(-50%,-50%);
    "></video>`)
        }, 500)
        SharedService.loading('login', true);
    }
}
