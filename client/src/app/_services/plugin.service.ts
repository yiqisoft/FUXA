import { HttpClient, HttpHeaders } from "@angular/common/http";
import { EventEmitter, Injectable, Output } from "@angular/core";
import { Observable } from "rxjs";

import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { environment } from "../../environments/environment";
import { EndPointApi } from "../_helpers/endpointapi";
import { Plugin } from "../_models/plugin";

@Injectable()
export class PluginService {
    @Output() onPluginsChanged: EventEmitter<any> = new EventEmitter();

    private endPointConfig: string = EndPointApi.getURL();

    constructor(
        private http: HttpClient,
        private translateService: TranslateService,
        private toastr: ToastrService
    ) {}

    getPlugins() {
        return this.http.get<Plugin[]>(
            this.endPointConfig + "/scada/api/plugins"
        );
    }

    installPlugin(plugin: Plugin) {
        return new Observable((observer) => {
            if (environment.serverEnabled) {
                let header = new HttpHeaders({
                    "Content-Type": "application/json",
                });
                this.http
                    .post<any>(this.endPointConfig + "/scada/api/plugins", {
                        headers: header,
                        params: plugin,
                    })
                    .subscribe(
                        (result) => {
                            observer.next();
                            this.onPluginsChanged.emit();
                        },
                        (err) => {
                            console.error(err);
                            observer.error(err);
                        }
                    );
            } else {
                observer.next();
            }
        });
    }

    removePlugin(plugin: Plugin) {
        return new Observable((observer) => {
            if (environment.serverEnabled) {
                let header = new HttpHeaders({
                    "Content-Type": "application/json",
                });
                this.http
                    .delete<any>(this.endPointConfig + "/scada/api/plugins", {
                        headers: header,
                        params: { param: plugin.name },
                    })
                    .subscribe(
                        (result) => {
                            observer.next();
                            this.onPluginsChanged.emit();
                        },
                        (err) => {
                            console.error(err);
                            observer.error(err);
                        }
                    );
            } else {
                observer.next();
            }
        });
    }
}
