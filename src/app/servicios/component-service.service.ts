import { Injectable } from '@angular/core';
import { HorarioModel } from '@model/horario-model';
import { MatrizHorariaModel } from '@model/matriz-horaria-model';
import { TableViewModel } from '@model/table-view-model';
import {BloqueHorarioService} from '@service/bloqueHorario.service';
import * as _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as moment from 'moment-timezone';
import { MatrizHorariaTransferObject } from '@data-transfer/matriz-horaria-transfer-object';
import { BloqueHorarioTransferObject } from '@data-transfer/bloque-horario-transfer-object';
import { ClaseDiaModel } from '@model/clase-dia-model';
import { PeriodoModel } from '@model/periodo-model';
import { HorarioTransferObject } from '@data-transfer/horario-transfer-object';


@Injectable({
    providedIn: 'root'
})

export class ComponentService{
    constructor(
        private BloqueHorarioService: BloqueHorarioService,
        private AlertService: NzMessageService
    ){}

    async getInitialData(): Promise<any>{
        let MatrizHorariaData: MatrizHorariaModel[] = [];
        let MatrizHorariaKey: Number = 0;
        let BloqueHorarioData: any[]= [];
        let TableDataView: TableViewModel[]= [];
        let DisbleHoursList: Number[][] = [];
        try{
            MatrizHorariaData = await this.BloqueHorarioService.getMatrizHoraria().toPromise();
            MatrizHorariaKey = MatrizHorariaData[0].id;
            const preDataBloqueHorario = await this.BloqueHorarioService.getBloqueHorario(MatrizHorariaKey).toPromise();
            const groupedData = _.groupBy(preDataBloqueHorario,entity => entity.claseDia.nombre);
            BloqueHorarioData = Object.values(groupedData);
            BloqueHorarioData.forEach(element=>{
                let tempObject: TableViewModel = { 
                    IdBloques:[],
                    Tiempo:{
                      TotalHoras: [],
                      Horarios: [],
                      HorarioString: []
                    }
                };
                tempObject.ClaseDia = element[0].claseDia.nombre;
                element.forEach(item =>{
                    tempObject.IdBloques.push(item.id);
                });
                TableDataView.push(tempObject);
            })

            for(const element of TableDataView){
                let hourArray: Number[] = [];
                for(const item of element.IdBloques){
                    try{
                        const result: HorarioModel[] = await this.BloqueHorarioService.getHorario(item).toPromise();
                        let totalHorasTemp: number = 0;
                        let horarioStringTemp: String = '';
                        let horarioActual: String;
                        let tempHorarioObject:Array<{Horario:String,Id:Number}> =[];
                        for(const itm of result){
                            horarioActual = moment(itm.horaInicio.toString()).utcOffset(0).format('HH') + ' a '+ moment(itm.horaFinal.toString()).utcOffset(0).format('HH');
                            if(moment(itm.horaFinal.toString()).utcOffset(0).hours() > moment(itm.horaInicio.toString()).utcOffset(0).hours()){
                                for(let i= moment(itm.horaInicio.toString()).utcOffset(0).hours() ; i != moment(itm.horaFinal.toString()).utcOffset(0).hours()+1 ; i++){
                                    hourArray.push(i);
                                }
                                totalHorasTemp+= moment(itm.horaFinal.toString()).utcOffset(0).diff(moment(itm.horaInicio.toString()).utcOffset(0),'hours');
                            }else{
                                for(let i = moment(itm.horaInicio.toString()).utcOffset(0).hours(); (i % 24) != moment(itm.horaFinal.toString()).utcOffset(0).hours()+1; i++ ){
                                    hourArray.push(i%24);
                                }
                                totalHorasTemp+= (moment(itm.horaFinal.toString()).utcOffset(0).hours()+24) - moment(itm.horaInicio.toString()).utcOffset(0).hours();
                            }
                            horarioStringTemp+= horarioActual + '\n';
                            tempHorarioObject.push({Id:itm.id,Horario:horarioActual});
                        }
                        element.Tiempo.Horarios.push(tempHorarioObject);
                        element.Tiempo.HorarioString.push(horarioStringTemp);
                        element.Tiempo.TotalHoras.push(totalHorasTemp);
                    }catch(error){
                        this.handleError(error);
                    }
                }
                DisbleHoursList.push(_.uniq(hourArray));
            }
            //Retorna Los Valores reales ya que no son argumentos por referencia y se pierde la data al terminar la funcion
            return {
                MHD: MatrizHorariaData,
                MHK: MatrizHorariaKey,
                BHD: BloqueHorarioData,
                TDV: TableDataView,
                DHL: DisbleHoursList
            }
        }catch(error){
            this.handleError(error);
        }
    }

    async updateBloquesHorarios(id: Number): Promise<any>{
        let BloqueHorarioData: any[] = [];
        let TableDataView: TableViewModel[]= [];
        let DisbleHoursList: Number[][] = [];
        try{
            const preDataBloqueHorario = await this.BloqueHorarioService.getBloqueHorario(id).toPromise();
            const groupedData = _.groupBy(preDataBloqueHorario,entity => entity.claseDia.nombre);
            BloqueHorarioData = Object.values(groupedData);
            BloqueHorarioData.forEach(element=>{
                let tempObject: TableViewModel = { 
                    IdBloques:[],
                    Tiempo:{
                      TotalHoras: [],
                      Horarios: [],
                      HorarioString: []
                    }
                };
                tempObject.ClaseDia = element[0].claseDia.nombre;
                element.forEach(item =>{
                    tempObject.IdBloques.push(item.id);
                });
                TableDataView.push(tempObject);
            });
            for(const element of TableDataView){
                let hourArray: Number[] = [];
                for(const item of element.IdBloques){
                    try{
                        const result: HorarioModel[] = await this.BloqueHorarioService.getHorario(item).toPromise();
                        let totalHorasTemp: number = 0;
                        let horarioStringTemp: String = '';
                        let horarioActual: String;
                        let tempHorarioObject:Array<{Horario:String,Id:Number}> = [];
                        for(const itm of result){
                            horarioActual = moment(itm.horaInicio.toString()).utcOffset(0).format('HH') + ' a '+ moment(itm.horaFinal.toString()).utcOffset(0).format('HH');
                            if(moment(itm.horaFinal.toString()).utcOffset(0).hours() > moment(itm.horaInicio.toString()).utcOffset(0).hours()){
                                for(let i= moment(itm.horaInicio.toString()).utcOffset(0).hours() ; i != moment(itm.horaFinal.toString()).utcOffset(0).hours()+1 ; i++){
                                    hourArray.push(i);
                                }
                                totalHorasTemp+= moment(itm.horaFinal.toString()).utcOffset(0).diff(moment(itm.horaInicio.toString()).utcOffset(0),'hours');
                            }else{
                                for(let i = moment(itm.horaInicio.toString()).utcOffset(0).hours(); (i % 24) != moment(itm.horaFinal.toString()).utcOffset(0).hours()+1; i++ ){
                                    hourArray.push(i%24);
                                }
                                totalHorasTemp+= (moment(itm.horaFinal.toString()).utcOffset(0).hours()+24) - moment(itm.horaInicio.toString()).utcOffset(0).hours();
                            }
                            horarioStringTemp+= horarioActual + '\n';
                            tempHorarioObject.push({Id:itm.id,Horario:horarioActual});
                        }
                        element.Tiempo.Horarios.push(tempHorarioObject);
                        element.Tiempo.HorarioString.push(horarioStringTemp);
                        element.Tiempo.TotalHoras.push(totalHorasTemp);
                    }catch(error){
                        this.handleError(error);
                    }
                    
                }
                DisbleHoursList.push(_.uniq(hourArray));
            }

            return {
                BHD: BloqueHorarioData,
                TDV: TableDataView,
                DHL: DisbleHoursList
            }
        }catch(error){
            this.handleError(error);
        }
    }

    async updateMatrizHoraria(MatrizHorariaKey: Number): Promise<any>{
        let MatrizHorariaData: MatrizHorariaModel[] = [];
        try{
            MatrizHorariaData = await this.BloqueHorarioService.getMatrizHoraria().toPromise();
            const {BHD,TDV,DHL} = await this.updateBloquesHorarios(MatrizHorariaKey);
            return {
                MHD: MatrizHorariaData,
                BHD: BHD,
                TDV: TDV,
                DHL: DHL
            }
        }catch(error){
            this.handleError(error);
        }
    }

    async postMatrizHoraria(object: MatrizHorariaTransferObject): Promise<MatrizHorariaModel[]>{
        try{
            const responseId: Number = await (await this.BloqueHorarioService.postMatrizHoraria(object).toPromise()).id;
            await this.autoGenerateBloqueHorario(responseId);
            this.AlertService.success("Matriz Horaria Creada");
            return await this.BloqueHorarioService.getMatrizHoraria().toPromise();
        }catch(error){
            this.handleError(error);
        }
    }

    async postBloqueHorario(object: BloqueHorarioTransferObject): Promise<void>{
        try {
            await this.BloqueHorarioService.postBloqueHorario(object).toPromise();
        } catch (error) {
            this.handleError(error);
        }
    }

    async autoGenerateBloqueHorario(id: Number): Promise<void>{
        try {
            const clasesDias: ClaseDiaModel[] = await this.BloqueHorarioService.getClaseDia().toPromise();
            const periodos: PeriodoModel[] = await this.BloqueHorarioService.getPeriodo().toPromise();
            let postObjects: BloqueHorarioTransferObject[] = [];

            for(const dia of clasesDias){
                for(const periodo of periodos){
                    let bodyObject: BloqueHorarioTransferObject = {
                        claseDiaId: dia.id,
                        estado: true,
                        periodoId: periodo.id,
                        matrizHorariaId: id,
                        descripcion: ' ',
                        observacion: ' '
                      }
                      postObjects.push(bodyObject);
                }
            }

            for(const element of postObjects){
                try {
                    await this.postBloqueHorario(element);
                } catch (error) {
                    this.handleError(error);
                }
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async postHorario(object: HorarioTransferObject): Promise<void>{
        try{
            /* return await(await this.BloqueHorarioService.postHorario(object).toPromise()).id */;
            await this.BloqueHorarioService.postHorario(object).toPromise()
        }catch(error){
            this.handleError(error);
        }
    }

    async putHorario(object: HorarioTransferObject,id: Number): Promise<void>{
        try{
            await this.BloqueHorarioService.putHorario(id,object).toPromise();
        }catch(error){
            this.handleError(error);
        }
    }
    
    async updateMatrizHorariaDescripcion(id: Number,object: MatrizHorariaTransferObject): Promise<void>{
        try{
            await this.BloqueHorarioService.putMatrizHoraria(id,object).toPromise();
        }catch(error){
            this.handleError(error);
        }
    }
    
    async horariosRefresh(data: TableViewModel): Promise<any>{
        let DisbleHoursList: Number[] = [];
        let returnObject: TableViewModel={
            IdBloques: data.IdBloques,
            ClaseDia: data.ClaseDia,
            Tiempo:{
                TotalHoras:[],
                HorarioString:[],
                Horarios:[]
            }
        };
        for(const item of data.IdBloques){
            try{
                const result: HorarioModel[] = await this.BloqueHorarioService.getHorario(item).toPromise();
                let totalHorasTemp: number = 0;
                let horarioStringTemp: String = '';
                let horarioActual: String;
                let tempHorarioObject:Array<{Horario:String,Id:Number}> = [];
                for(const itm of result){
                    if(moment(itm.horaFinal.toString()).utcOffset(0).hours() >  moment(itm.horaInicio.toString()).utcOffset(0).hours()){
                        for(let i= moment(itm.horaInicio.toString()).utcOffset(0).hours() ; i != moment(itm.horaFinal.toString()).utcOffset(0).hours()+1 ; i++){
                            DisbleHoursList.push(i);
                        }
                        totalHorasTemp+= moment(itm.horaFinal.toString()).utcOffset(0).diff(moment(itm.horaInicio.toString()).utcOffset(0),'hours');
                    }else{
                        for(let i = moment(itm.horaInicio.toString()).utcOffset(0).hours(); (i % 24) != moment(itm.horaFinal.toString()).utcOffset(0).hours()+1; i++ ){
                            DisbleHoursList.push(i%24);
                        }
                        totalHorasTemp+= (moment(itm.horaFinal.toString()).utcOffset(0).hours()+24) - moment(itm.horaInicio.toString()).utcOffset(0).hours();
                    }
                    horarioActual = moment(itm.horaInicio.toString()).utcOffset(0).format('HH') + ' a '+ moment(itm.horaFinal.toString()).utcOffset(0).format('HH');
                    horarioStringTemp+= horarioActual + '\n';
                    tempHorarioObject.push({Id:itm.id,Horario:horarioActual});
                }

                returnObject.Tiempo.Horarios.push(tempHorarioObject);
                returnObject.Tiempo.HorarioString.push(horarioStringTemp);
                returnObject.Tiempo.TotalHoras.push(totalHorasTemp);
            }catch(error){
                this.handleError(error);
            }
        }

        return {TDV: returnObject, DHL: _.uniq(DisbleHoursList)};
    }


    async deleteHorarios(data: TableViewModel,selectedHorarios: Number[]): Promise<any>{
        for(const id of selectedHorarios){
            await this.BloqueHorarioService.deleteHorario(id,{estado:false}).toPromise()
        }
        const {TDV,DHL} = await this.horariosRefresh(data);
        return {TDV: TDV, DHL: _.uniq(DHL)};
    }

    async deleteMatrizHoraria(id: Number): Promise<void>{
        try{
            await this.BloqueHorarioService.deleteMatrizHoraria(id,{estado:false}).toPromise();
        }catch(error){
            this.handleError(error);
        }
    }

    // Utitlity Functions -------------------------------
    handleHoursOverflow(object: TableViewModel,InitialHour: Number, FinalHour: Number): Boolean{
        const totalHorasActual = _.sum(object.Tiempo.TotalHoras);
        const totalHorasLocal = (FinalHour > InitialHour)? 
            (FinalHour.valueOf() - InitialHour.valueOf()):
            ((FinalHour.valueOf()+24) - InitialHour.valueOf())
        if((totalHorasActual+totalHorasLocal)>24){
            return true;
        }else{
            return false;
        }
    }

    handleMessage(message: String):void{
        this.AlertService.success(message.toString());
    }

    handleMessageError(message: String):void{
        this.AlertService.error(message.toString());
    }

    handleError(error:any){
        console.error(error);
        this.AlertService.error(`Ha ocurrido un error Inesperado, Codigo:${error.status}`)
    }

    returnIndexMatrizHorariaData(object: MatrizHorariaModel[],id: Number): number {
        return _.findIndex(object, (itm)=> itm.id === id);
    }
    //---------------------------------------------------
}