import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { CatService } from '../services/cat.service';
import { ToastComponent } from '../shared/toast/toast.component';
import { Cat } from '../shared/models/cat.model';
declare var d3: any;

@Component({
  selector: 'app-cats',
  templateUrl: './cats.component.html',
  styleUrls: ['./cats.component.css']
})

export class CatsComponent implements OnInit {
  
  cat = new Cat();
  cats: Cat[] = [];
  isLoading = true;
  isEditing = false;
  

  addCatForm: FormGroup;
  name = new FormControl('', Validators.required);
  shares = new FormControl('', Validators.required);
  boughtAt = new FormControl('', Validators.required);
  user = new FormControl('');
  constructor(private catService: CatService,
              private formBuilder: FormBuilder,
              public toast: ToastComponent) { }

  ngOnInit() {
    this.getCats();
    
	let user1 = document.getElementById("getUserFrom").innerHTML.split('(')[1];
	user1 = user1.split(')')[0];
    this.addCatForm = this.formBuilder.group({
      name: this.name,
      shares: this.shares,
      boughtAt: this.boughtAt,
	  user: user1
    });
    //this.cats = <Cat[]> this.getPrices(this.cats);
    //console.log(this.cats[0]);
  }

  getCats() {
    let user = document.getElementById("getUserFrom").innerHTML.split('(')[1];
    user = user.split(')')[0];
    this.catService.getCats(user).subscribe(
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
    this.catService.addCat(this.addCatForm.value).subscribe(
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
      this.catService.getPrice(Cats[i].name, i).subscribe(
        data => {
          this.cats[data['index']].value = data['latestPrice'];
          this.cats[data['index']].index = data['index'];
          this.cats[len].value += data['latestPrice'] * this.cats[data['index']].shares;
          this.cats[len].boughtAt += this.cats[data['index']].boughtAt * this.cats[data['index']].shares;
          this.genGraph(this.cats[data['index']]);
          if (i === Cats.length - 1) { setTimeout(this.genGraph(this.cats[len]),500); }

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
    this.catService.editCat(cat).subscribe(
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
      this.catService.deleteCat(cat).subscribe(
        () => {
          const pos = this.cats.map(elem => elem._id).indexOf(cat._id);
          this.cats.splice(pos, 1);
          this.toast.setMessage('item deleted successfully.', 'success');
        },
        error => console.log(error)
      );
    }
  }

}
