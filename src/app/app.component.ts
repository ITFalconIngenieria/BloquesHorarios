import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BloqueHorarioService } from './servicios/bloqueHorario.service';
import swal from 'sweetalert';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as moment from 'moment';
moment.locale('es');


interface Name {
  title: string;
  first: string;
  last: string;
}

interface MatrizVista {
  matrizhorariaid: number;
  Id: number;
  codigo: string;
  fechaCreacion: string;
  descripcion: string;
  observacion: string;
  bloque: number;
  periodoId: number;
  periodo: string;
  diaId: number;
  dia: string;
  horarioId: number;
  horaInicio: string;
  horaFinal: string;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  DataCD: any;
  validateForm: FormGroup;
  isVisible = false;
  isVisibleConfi = false;
  codigo;
  fecha;
  permiso: any;
  descripcion;
  observacion;
  MHEdit;
  pag = 1;
  accion: string;
  fechaFeriado;
  descripcionFeriado;
  arrayDiasFeriado;
  inputValue: string;
  dataPeriodo: any[] = [];
  dataClaseDia: any[] = [];
  dataMatriz: any[] = [];
  arrayMHID: any[] = [];
  expandSet = new Set<any>();

  listofDataMH: any[] = [];

  listOfDias: any[] = [
    {
      id: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
    },
    {
      id: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      id: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
    {
      id: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
    {
      id: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
    {
      id: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
    {
      id: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
    {
      id: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
  ];

  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private bloqueHorarioService: BloqueHorarioService
  ) { }

  ngOnInit() {
    this.accion = 'new';
    this.permiso = (localStorage.getItem('permiso') === 'true') ? true : false;
    this.bloqueHorarioService
      .vistaMatrizHoraria()
      .toPromise()
      .then((data: any[]) => {
        console.log(data);

        this.DataCD = data;

        this.dataPeriodo = data.reduce((acumulador, valorActual) => {
          const elementoYaExiste = acumulador.find(
            (elemento) =>
              elemento.periodo === valorActual.periodo
          );
          if (elementoYaExiste) {
            return acumulador.map((elemento) => {
              if (elemento.periodo === valorActual.periodo) {
                return {
                  ...elemento,
                };
              }
              return elemento;
            });
          }
          return [...acumulador, valorActual];
        }, []);

        this.dataClaseDia = data.reduce((acumulador, valorActual) => {
          const elementoYaExiste = acumulador.find(
            (elemento) =>
              elemento.dia === valorActual.dia
          );
          if (elementoYaExiste) {
            return acumulador.map((elemento) => {
              if (elemento.dia === valorActual.dia) {
                return {
                  ...elemento,
                };
              }
              return elemento;
            });
          }
          return [...acumulador, valorActual];
        }, []);

        this.dataPeriodo.forEach((t) => {
          this.arrayMHID.push(t.matrizhorariaid);
        });
        this.arrayMHID = [...new Set(this.arrayMHID)];
        this.CrearTabla(this.arrayMHID[this.pag - 1]);
      });

    this.limpiarMatriz();
  }

  submitForm(): void {
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

  }

  limpiarMatriz() {
    this.validateForm = this.fb.group({
      codigo: [null, [Validators.required]],
      fechaCreacion: [null],
      descripcion: [''],
      observacion: [''],
    });
  }


  ShowNotification(type: string, titulo: string, mensaje: string): void {
    this.notification.create(
      type,
      titulo,
      mensaje
    );
  }

  guardarMH() {
    // tslint:disable-next-line: max-line-length
    this.validateForm.value.observacion = (this.validateForm.value.observacion === '' || this.validateForm.value.observacion === null) ? 'N/A' : this.validateForm.value.observacion;

    const dataMH = {
      ...this.validateForm.value,
      estado: true
    };

    if (this.accion === 'editar') {
      this.bloqueHorarioService.putMatrizHoraria(this.MHEdit, dataMH)
        .toPromise()
        .then(
          () => {
            this.ShowNotification(
              'success',
              'Guardado con éxito',
              'El registro fue guardado con éxito'
            );

            // for (const item of this.listofDataMH.filter(x => x.id === this.MHEdit)) {
            //   item.codigo = dataMH.codigo;
            //   item.descripcion = dataMH.descripcion;
            //   item.fechaCreacion = dataMH.fechaCreacion;
            //   item.observacion = dataMH.observacion;
            //   item.estado = dataMH.estado;
            // }

            this.accion = 'new';
            this.limpiarMatriz();
            this.isVisible = false;
          },
          (error) => {

            this.ShowNotification(
              'error',
              'No se pudo guardar',
              'El registro no pudo ser guardado, por favor revise los datos ingresados sino comuníquese con el proveedor.'
            );
            console.log(error);
            this.limpiarMatriz();
            this.accion = 'new';
            this.isVisible = false;
          }
        );
    } else {
      this.bloqueHorarioService.postMatrizHoraria(dataMH)
        .toPromise()
        .then(
          (data: any) => {
            this.ShowNotification(
              'success',
              'Guardado con éxito',
              'El registro fue guardado con éxito'
            );
            this.listofDataMH = [...this.listofDataMH, data];

            this.limpiarMatriz();
          },
          (error) => {

            this.ShowNotification(
              'error',
              'No se pudo guardar',
              'El registro no pudo ser guardado, por favor revise los datos ingresados sino comuníquese con el proveedor.'
            );
            console.log(error);
            this.limpiarMatriz();
          });
    }
  }

  editar(data) {
    this.accion = 'editar';
    this.isVisible = true;

    this.MHEdit = data.id;
    this.validateForm = this.fb.group({
      codigo: [data.codigo, [Validators.required]],
      descripcion: [data.descripcion],
      fechaCreacion: [moment(data.fechaCreacion).add(6, 'hours').format('YYYY-MM-DD HH:mm')],
      observacion: [data.observacion],
    });

  }

  eliminar(data) {
    swal({
      title: '¿Está seguro de borrar el registro?',
      icon: 'warning',
      buttons: [true],
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          this.bloqueHorarioService.deleteMatrizHoraria(data.id, { estado: false })
            .toPromise()
            .then(
              () => {
                this.ShowNotification(
                  'success',
                  'Eliminado',
                  'El registro fue eliminado con éxito'
                );
                // this.listOfDataZona = this.listOfDataZona.filter(x => x.id !== data.id);

              },
              (error) => {

                this.ShowNotification(
                  'error',
                  'No se pudo eliminar',
                  'El registro no pudo ser eleminado, por favor revise su conexión a internet o comuníquese con el proveedor.'
                );
                console.log(error);
              });

        } else {
          swal('Su registro sigue activo');
        }
      });
  }

  onExpandChange(id: any, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  GetClaseDia(ClaseDia) {
    return this.DataCD.filter(x => x.matrizhorariaid == this.arrayMHID[this.pag - 1] && x.diaId == ClaseDia)[0].dia;
  }

  CrearTabla(idMatriz) {
    const array = this.DataCD.filter(x => x.matrizhorariaid === idMatriz);
    console.log(array);
    this.codigo = array[0].codigo;
    this.fecha = array[0].fechaCreacion;
    this.descripcion = array[0].descripcion;
    this.observacion = array[0].observacion;

    let ClaseDia = [];
    let Periodo = [];
    const parametros = [];
    let cont = 0;
    // tslint:disable-next-line: forin
    for (const key in array) {
      ClaseDia[key] = array[key].diaId;
      Periodo[key] = array[key].periodoId;
    }

    ClaseDia = [...new Set(ClaseDia)];
    Periodo = [...new Set(Periodo)];

    let cdia = '';
    let totalh = 0;
    let horario = '';
    let periodo;
    for (let x = 0; x < ClaseDia.length; x++) {
      parametros.push({ indice: x })
      for (let y = 0; y < Periodo.length; y++) {
        for (const item of array.filter(j => j.periodoId === Periodo[y] && j.diaId === ClaseDia[x])) {
          cdia = item.diaId;
          periodo = item.periodo;
          totalh += moment(item.horaFinal).diff(moment(item.horaInicio), 'hours');
          horario += moment(item.horaInicio).format('HH') + ' a ' + moment(item.horaFinal).format('HH') + ',';
        }
        parametros[x]['Dia' + y] = cdia;
        parametros[x]['totalh' + y] = Math.abs(totalh);
        parametros[x]['horario' + y] = horario.substring(0, horario.length - 1);
        parametros[x]['periodo' + y] = periodo;

        cont += 4;
        cdia = '';
        totalh = 0;
        horario = '';
        periodo = '';
      }
      cont = 0;
    }

    this.dataMatriz = [...parametros];
  }

  pagebyMatriz(arreglo: any, pag) {
    return arreglo.filter((x) => x.matrizhorariaid === pag);
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.accion = 'new';
    this.isVisible = false;
  }

  handleOk(): void {
    this.accion = 'new';
    this.isVisible = false;
  }

  showModalConfi(): void {
    this.isVisibleConfi = true;
  }

  handleCancelConfi(): void {
    this.accion = 'new';
    this.isVisibleConfi = false;
  }

  handleOkConfi(): void {
    this.accion = 'new';
    this.isVisibleConfi = false;
  }

  onChange(result: Date): void {
    console.log('onChange: ', result);
  }

  onValueChange(value: Date): void {
    console.log(`Current value: ${value}`);
  }

  onPanelChange(change: { date: Date; mode: string }): void {
    console.log(`Current value: ${change.date}`);
    console.log(`Current mode: ${change.mode}`);
  }
}

