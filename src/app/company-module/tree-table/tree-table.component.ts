import { Component, OnInit } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from './treenode';

@Component({
  selector: 'app-tree-table',
  templateUrl: './tree-table.component.html',
  styleUrls: ['./tree-table.component.css']
})
export class TreeTableComponent implements OnInit {

  arrData: TreeNode[];
  selectedNode = [];
  constructor() { }

  ngOnInit() {
    let data = {
        "data": [
          {
            "data": {
              "id":1,
              "name": "Documents",
              "size": "75kb",
              "type": "Folder",
              "partialSelected": true,
              "isSelected":true
            },
            "children": [
              {
                "data": {
                  "id":2,
                  "name": "Work",
                  "size": "55kb",
                  "type": "Folder",
                  "isSelected":false
                },
                "children": [
                  {
                    "data": {
                      "id":3,
                      "name": "Expenses.doc",
                      "size": "30kb",
                      "type": "Document",
                      "isSelected":false
                    }
                  },
                  {
                    "data": {
                      "id":4,
                      "name": "Resume.doc",
                      "size": "25kb",
                      "type": "Resume",
                      "isSelected":false
                    }
                  }
                ]
              },
              {
                "data": {
                  "id":5,
                  "name": "Home",
                  "size": "20kb",
                  "type": "Folder",
                  "isSelected":false
                },
                "children": [
                  {
                    "data": {
                      "id":6,
                      "name": "Invoices",
                      "size": "20kb",
                      "type": "Text",
                      "isSelected":false
                    }
                  }
                ]
              }
            ]
          },
          {
            "data": {
              "id":7,
              "name": "Pictures",
              "size": "150kb",
              "type": "Folder",
              "isSelected":false
            },
            "children": [
              {
                "data": {
                  "id":8,
                  "name": "barcelona.jpg",
                  "size": "90kb",
                  "type": "Picture",
                  "isSelected":false
                }
              },
              {
                "data": {
                  "id":9,
                  "name": "primeui.png",
                  "size": "30kb",
                  "type": "Picture",
                  "isSelected":false
                }
              },
              {
                "data": {
                  "id":10,
                  "name": "optimus.jpg",
                  "size": "30kb",
                  "type": "Picture",
                  "isSelected":false
                }
              }
            ]
          }
        ]
      }
    this.arrData = data.data;
  }

  
  /**
   * Set Node Selection. We push Selected Node in selectedNode array.
   * @param node - Current Selected Node
   * @param isSelected  - Current Selected Node Selected or Unselected
   */
  setNodeSelected(node,isSelected) {
    if(isSelected)
    {
      if (this.selectedNode.indexOf(node.data) == -1) {
        this.selectedNode.push(node.data);
      }
      
      if (node.children && node.children.length > 0) {
        for (var i = 0; i < node.children.length; i++) {
          node.children[i].data.isSelected=true;
          if (this.selectedNode.indexOf(node.children[i].data) == -1) {
            this.selectedNode.push(node.children[i].data);
          }
          this.setNodeSelected(node.children[i],isSelected);
        }
      }
    }
    else{

      if (this.selectedNode.indexOf(node.data) > -1) {
        var idx = this.selectedNode.indexOf(node.data);
        this.selectedNode.splice(idx, 1)
      }
      
      if (node.children && node.children.length > 0) {
        for (var i = 0; i < node.children.length; i++) {
          node.children[i].data.isSelected=false;
          if (this.selectedNode.indexOf(node.children[i].data) > -1) {
            var idx = this.selectedNode.indexOf(node.children[i].data);
            this.selectedNode.splice(idx, 1)
          }
          this.setNodeSelected(node.children[i],isSelected);
        }
      }
    }
  }
  
}
