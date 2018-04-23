import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController } from 'ionic-angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastComponent } from '../shared/toast/toast.component';
import { Item } from '../../models/item';
import { CatService } from '../services/cat.service';
import { Cat } from '../shared/models/cat.model';
import { Items } from '../../providers/providers';
declare var d3: any;
import { HttpClient, HttpParams } from '@angular/common/http';

@IonicPage()
@Component({
  selector: 'page-list-master',
  templateUrl: 'list-master.html'
})
export class ListMasterPage {
  currentItems: Item[];
  cat = new Cat();
  cats: Cat[] = [];
  isLoading = true;
  isEditing = false;


  addCatForm: FormGroup;
  name;
  shares;
  boughtAt;
  user;
  
  formBuilder = new FormBuilder();
  toast = new ToastComponent();
 
  constructor(public http: HttpClient,
    public navCtrl: NavController, public items: Items, public modalCtrl: ModalController) {
    this.currentItems = this.items.query();
  }
  
  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {
    this.getCats();

    let user1 = localStorage.getItem('uName');
    this.addCatForm = this.formBuilder.group({
      name: this.name,
      shares: this.shares,
      boughtAt: this.boughtAt,
      user: user1
    });
  }
  getCats() {
    let catService = new CatService(this.http);
    let user = localStorage.getItem('uName');
    catService.getCats(user).subscribe(
      data => {
        this.cats = data;
        console.log(this.cats);
      },
      error => console.log(error),
      () => {
        this.getPrices(this.cats);
        this.isLoading = false
      }
    );
  }

  addCat() {
    let toAdd = new Cat();
    let catService = new CatService(this.http);
    toAdd.name = (<HTMLInputElement>document.getElementById("addName")).value;
    toAdd.shares = +(<HTMLInputElement>document.getElementById("addShares")).value;
    toAdd.boughtAt = +(<HTMLInputElement>document.getElementById("addPrice")).value;
    toAdd.user = localStorage.getItem('uName');
    
    
    catService.addCat(toAdd).subscribe(
      res => {
        this.cats.push(res);
        this.addCatForm.reset();
        this.toast.setMessage('item added successfully.', 'success');
      },
      error => console.log(error)
    );
  }

  getPrices(Cats: Cat[]): any {
    let len = Cats.length;
    this.cats.push(new Cat());
    this.cats[len].name = "TOTAL";
    this.cats[len].index = len;
    this.cats[len].boughtAt = 0;
    this.cats[len].value = 0;
    this.cats[len].shares = 1;
    for (var i = 0; i < len; i++) {
      this.cats[i].index = i;
      let catService = new CatService(this.http);
      catService.getPrice(Cats[i].name, i).subscribe(
        data => {
          this.cats[data['index']].value = data['latestPrice'];
          this.cats[data['index']].index = data['index'];
          this.cats[len].value += data['latestPrice'] * this.cats[data['index']].shares;
          this.cats[len].boughtAt += this.cats[data['index']].boughtAt * this.cats[data['index']].shares;
          this.genGraph(this.cats[data['index']]);
          if (i === Cats.length - 1) { setTimeout(this.genGraph(this.cats[len]), 500); }

        },
        error => console.log(error),
        () => this.isLoading = false
      );
    }


  }

  round(num: number): number {
    return Math.round(num * 100) / 100;
  }

  genGraph(cat: Cat) {
    let dataArray = [this.round(cat.boughtAt), this.round(cat.value)];
    console.log(dataArray);
    let graphID = "#graph" + cat.index;
    let svg = d3.select(graphID);
    console.log(svg);
    svg.selectAll("rect")
      .data(dataArray)
      .enter().append("rect")
      .attr("style", "fill:#007bff")
      .attr("height", function (d, i) { return (d / cat.boughtAt) * 200 })
      .attr("width", "80")
      .attr("x", function (d, i) { return (i * 120) + 25 })
      .attr("y", function (d, i) { return 300 - ((d / cat.boughtAt) * 200) });
    svg.selectAll("text")
      .data(dataArray)
      .enter().append("text")
      .text(function (d) { return d; })
      .attr("x", function (d, i) { return (i * 120) + 25 })
      .attr("y", function (d, i) { return 315 - ((d / cat.boughtAt) * 200) });
  }

  enableEditing(cat: Cat) {
    this.isEditing = true;
    this.cat = cat;
  }

  cancelEditing() {
    this.isEditing = false;
    this.cat = new Cat();
    this.toast.setMessage('item editing cancelled.', 'warning');
    // reload the cats to reset the editing
    this.getCats();
  }

  editCat(cat: Cat) {
    let catService = new CatService(this.http);
    catService.editCat(cat).subscribe(
      () => {
        this.isEditing = false;
        this.cat = cat;
        this.toast.setMessage('item edited successfully.', 'success');
      },
      error => console.log(error)
    );
  }



  deleteCat(cat: Cat) {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      let catService = new CatService(this.http);
      catService.deleteCat(cat).subscribe(
        () => {
          const pos = this.cats.map(elem => elem._id).indexOf(cat._id);
          this.cats.splice(pos, 1);
          this.toast.setMessage('item deleted successfully.', 'success');
        },
        error => console.log(error)
      );
    }
  }

  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  addItem() {
    let addModal = this.modalCtrl.create('ItemCreatePage');
    addModal.onDidDismiss(item => {
      if (item) {
        this.items.add(item);
      }
    })
    addModal.present();
  }

  /**
   * Delete an item from the list of items.
   */
  deleteItem(item) {
    this.items.delete(item);
  }

  /**
   * Navigate to the detail page for this item.
   */
  openItem(item: Item) {
    this.navCtrl.push('ItemDetailPage', {
      item: item
    });
  }
}
