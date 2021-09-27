class PubSub {
    constructor() {
        this.subscribers = [];
    }
     
    subscribe(topic, callback) {
        let callbacks =this.subscribers[topic];
        if(!callbacks) {
            this.subscribers[topic] = [callback];
        }else{
            callbacks.push(callback);
        }
    }
     
    publish(topic, ...args) {
        let callbacks =this.subscribers[topic] || [];
        callbacks.forEach(callback => callback(...args));
    }
}
 
let pubSub =new PubSub();

let freeze;
let btn = document.getElementById("btn");
let br = new fabric.Canvas('canvas');
const imgURL = `https://th.bing.com/th/id/OIP.28EBZUBR_BR6yOf7Gen8twAAAA?pid=ImgDet&rs=1`;
document.getElementsByClassName("canvas-container")[0].setAttribute("style","position:absolute")

let rect4 = new fabric.Rect({
    deltaX:0,
    deltaY:0,
    id:1,
    width:150,
    height:150,
    left: 30,
    top: 30,
    fill:"gray",
})


let rect4a = new fabric.Rect({
    deltaX:0,
    deltaY:0,
    id:2,
    width:150,
    height:150,
    left: 200,
    top: 200,
    fill:"royalblue",
})
new fabric.Image.fromURL(imgURL, img => {
    img.set({
        id:3,
        deltaX:0,
        deltaY:0,
        left:0,
        top:0,
    })
  
    br.add(img)
});
br.add(rect4);
br.add(rect4a);



let events = {
    "object:rotating":(evt)=>{
        console.log("object:rotating")
        pubSub.publish("object:rotating",evt);
    },
    
    "object:moving":(evt)=>{
        console.log("object:moving")
        pubSub.publish("object:moving",evt);
   
    },
    "object:scaling":(evt)=>{
        console.log("object:scaling")
        pubSub.publish("object:scaling",evt);
    },
    "selection:created" :(evt)=>{
        console.log("selection:created")
        pubSub.publish("selection:created",evt);
    },
    "selection:cleared":(evt)=>{
        console.log("selection:cleared")
        pubSub.publish("selection:cleared",evt);
    },
    "selection:updated":(evt)=>{
        console.log("selection:updated")
        pubSub.publish("selection:updated",evt);
    },
    "mouse:wheel":(evt)=>{
        console.log("mouse:wheel")
        pubSub.publish("mouse:wheel",evt);

    },
}


btn.addEventListener("click",() => {
    if (!!!freeze) {
        console.log("Frosting")
        let div = document.getElementById("div");

        let bl = createCanvas(div,"bl",100,400,JSON.stringify(br.toDatalessJSON(['id','deltaX','deltaY'])))
        let tr = createCanvas(div,"tr",400,100,JSON.stringify(br.toDatalessJSON(['id','deltaX','deltaY'])))
        let tl = createCanvas(div,"tl",100,100,JSON.stringify(br.toDatalessJSON(['id','deltaX','deltaY'])))

        br.clipPath = new fabric.Rect({
            width:br.width - 100,
            height:br.height - 100,
            left:100,
            top:100
        })
        bl.clipPath = new fabric.Rect({
            width:100,
            height: bl.height - 100,
            top:100,
        })
        tr.clipPath = new fabric.Rect({
            width:tr.width - 100,
            height:100,
            left: 100
        })
        
        for (let i = 0; i < document.getElementsByClassName("canvas-container").length;i++) {
            document.getElementsByClassName("canvas-container")[i].setAttribute("style","position:absolute")
        };
        for (key of Object.keys(events)) {
            br.on(key, events[key]);
            tr.on(key, events[key]);
            bl.on(key, events[key]);
            tl.on(key, events[key]);
        }

        // br
        pubSub.subscribe("reset", (evt)=>{
            if (evt.e.x > 100 && evt.e.y > 100) return ;
            let offsetMethod = (x) => {
                x.set({
                    left: x.left - x.deltaX?? 0, 
                    top: x.top - x.deltaY?? 0,
                    deltaX: 0,
                    deltaY: 0,
                })
                x.setCoords();
                x.clipPath = null;
                x.dirty = true;
            }
            reset(br,offsetMethod);
        })
        pubSub.subscribe("object:rotating", (evt)=>{
            let obj = find(br,evt.target.id);
            let moveOffset = {
                left: evt.target.left,
                top: evt.target.top,
                angle: evt.target.angle,
            };
            objectMoving(br,obj,moveOffset,null);
        });
        pubSub.subscribe("object:moving", (evt)=>{
            let obj = find(br,evt.target.id);
            let moveOffset = {
                left: evt.target.left,
                top: evt.target.top,
            };
            let left =  100 - evt.target.left;
            left = left < 0 ? 0 : left;
            let top = 100 - evt.target.top;
            top = top < 0 ? 0 : top;
            objectMoving(br,obj,moveOffset,null);
        });
        pubSub.subscribe("object:scaling", (evt)=>{
            let obj = find(br,evt.target.id);
            let moveOffset = {
                left: evt.target.left,
                top: evt.target.top,
                scaleX: evt.target.scaleX,
                scaleY: evt.target.scaleY,
            };
            objectMoving(br,obj,moveOffset,null);
        });
        pubSub.subscribe("selection:created", (evt)=>{
            pubSub.publish("reset",evt)
            selectionCreated(br,evt);
        });
        pubSub.subscribe("selection:cleared", (evt)=>{
            selectionCleared(br);
        });
        pubSub.subscribe("selection:updated", (evt)=>{
            selectionUpdated(br,evt);
        });
        pubSub.subscribe("mouse:wheel", (evt)=>{
            let deltaX = evt.e.deltaX/10;
            let deltaY = evt.e.deltaY/10;
            let ObjectsMoveMethod = (x)=>{
                x.set({
                    left:x.left + deltaX,
                    deltaX:x.deltaX + deltaX?? 0,
                    top:x.top + deltaY,
                    deltaY:x.deltaY + deltaY?? 0,
                })
            };
           
            mouseWheel(br,ObjectsMoveMethod,null);
        });
        // br

        // tr
        pubSub.subscribe("reset", (evt)=>{
            if (evt.e.x > 100 && evt.e.y > 100) return ;
            let offsetMethod = (x) => {
                x.set({
                    left: x.left - x.deltaX?? 0, 
                    deltaX: 0,
                    deltaY: 0,
                })
                x.setCoords();
                x.clipPath = null;
                x.dirty = true;
            }
            reset(tr,offsetMethod);
        })
        pubSub.subscribe("object:rotating", (evt)=>{
            let obj = find(tr,evt.target.id);
            let moveOffset = {
                left: evt.target.left,
                top: evt.target.top ,
                angle: evt.target.angle,
            };
            objectMoving(tr,obj,moveOffset,null);
        });
        pubSub.subscribe("object:moving", (evt)=>{
            let obj = find(tr,evt.target.id);
            let offsetY = evt.target.deltaY?? 0;  
            let moveOffset = {
                left: evt.target.left,  
                top: evt.target.top - offsetY, 
            };
            objectMoving(tr,obj,moveOffset,null);
        });
        pubSub.subscribe("object:scaling", (evt)=>{
            let obj = find(tr,evt.target.id);
            let moveOffset = {
                left: evt.target.left,
                top: evt.target.top,
                scaleX: evt.target.scaleX,
                scaleY: evt.target.scaleY,
            };
            objectMoving(tr,obj,moveOffset,null);
        });
        pubSub.subscribe("selection:created" , (evt)=>{
            pubSub.publish("reset",evt)
            selectionCreated(tr,evt);
        });
        pubSub.subscribe("selection:cleared", (evt)=>{
            selectionCleared(tr);
        });
        pubSub.subscribe("selection:updated", (evt)=>{
            selectionUpdated(tr,evt);
        });
        pubSub.subscribe("mouse:wheel", (evt)=>{
            let deltaX = evt.e.deltaX/10;
            let deltaY = evt.e.deltaY/10;
            let ObjectsMoveMethod = (x)=>{
                x.set({
                    left:x.left + deltaX,
                    deltaX:x.deltaX + deltaX?? 0,
                    deltaY:x.deltaY + deltaY?? 0,
                })
            };
            
            mouseWheel(tr,ObjectsMoveMethod,null);
        });
        // tr

        // tl
        pubSub.subscribe("reset", (evt)=>{
            
        })
        pubSub.subscribe("object:rotating", (evt)=>{
            let obj = find(tl,evt.target.id);
            let moveOffset = {
                left: evt.target.left ,  
                top: evt.target.top , 
                angle: evt.target.angle,
            };
            objectMoving(tl,obj,moveOffset,null);
        });
        pubSub.subscribe("object:moving", (evt)=>{
            let obj = find(tl,evt.target.id);
            let offsetX = evt.target.deltaX ?? 0;
            let offsetY = evt.target.deltaY?? 0;  
            let moveOffset = {
                left: evt.target.left - offsetX,  
                top: evt.target.top - offsetY, 
                fill :"orange"
            };
            objectMoving(tl,obj,moveOffset,null);
        });
        pubSub.subscribe("object:scaling", (evt)=>{
            let obj = find(tl,evt.target.id);
            let moveOffset = {
                left: evt.target.left,
                top: evt.target.top,
                scaleX: evt.target.scaleX,
                scaleY: evt.target.scaleY,
            };
            objectMoving(tl,obj,moveOffset,null);
        });
        pubSub.subscribe("selection:created" , (evt)=>{
            pubSub.publish("reset",evt)
            selectionCreated(tl,evt);
        });
        pubSub.subscribe("selection:cleared", (evt)=>{
            selectionCleared(tl);
        });
        pubSub.subscribe("selection:updated", (evt)=>{
            selectionUpdated(tl,evt);
        });
        pubSub.subscribe("mouse:wheel", (evt)=>{
            let deltaX = evt.e.deltaX/10;
            let deltaY = evt.e.deltaY/10;
            let ObjectsMoveMethod = (x)=>{
                x.set({
                    deltaX:x.deltaX + deltaX?? 0,
                    deltaY:x.deltaY + deltaY?? 0,
                })
            };
            mouseWheel(tl,ObjectsMoveMethod,null);
        });
        // tl

        // bl
        pubSub.subscribe("reset", (evt)=>{
            if (evt.e.x > 100 && evt.e.y > 100) return ;
            let offsetMethod = (x) => {
                x.set({
                    top: x.top - x.deltaY?? 0,
                    deltaX: 0,
                    deltaY: 0,
                })
                x.setCoords();
                x.clipPath = null;
                x.dirty = true;
            }
            reset(bl,offsetMethod);
        })
        pubSub.subscribe("object:rotating", (evt)=>{
            let obj = find(bl,evt.target.id);
            let moveOffset = {
                left: evt.target.left ,  
                top: evt.target.top, 
                angle: evt.target.angle,
            };
            objectMoving(bl,obj,moveOffset,null);
        });
        pubSub.subscribe("object:moving", (evt)=>{
            let obj = find(bl,evt.target.id);
            let offsetX = evt.target.deltaX ?? 0;
            let moveOffset = {
                left: evt.target.left - offsetX,  
                top: evt.target.top, 
                fill : "red"
            };
            objectMoving(bl,obj,moveOffset,null);
        });
        pubSub.subscribe("object:scaling", (evt)=>{
            let obj = find(bl,evt.target.id);
            let moveOffset = {
                left: evt.target.left,
                top: evt.target.top,
                scaleX: evt.target.scaleX,
                scaleY: evt.target.scaleY,
            };
            objectMoving(bl,obj,moveOffset,null);
        });
        pubSub.subscribe("selection:created" , (evt)=>{
            pubSub.publish("reset",evt)
            selectionCreated(bl,evt);
        });
        pubSub.subscribe("selection:cleared", (evt)=>{
            selectionCleared(bl);
        });
        pubSub.subscribe("selection:updated", (evt)=>{
            selectionUpdated(bl,evt);
        });
        pubSub.subscribe("mouse:wheel", (evt)=>{
            let deltaX = evt.e.deltaX/10;
            let deltaY = evt.e.deltaY/10;
            let ObjectsMoveMethod = (x)=>{
                x.set({
                    top:x.top + deltaY,
                    deltaX:x.deltaX + deltaX?? 0,
                    deltaY:x.deltaY + deltaY?? 0,
                })
            };
            mouseWheel(bl,ObjectsMoveMethod,null);
        });
        // bl

        freeze = {};
        freeze.bl = bl;
        freeze.tl = tl;
        freeze.tr = tr;
        
        
    } else {

        console.log("Defrosting")
        reset();
        for (key of Object.keys(events)) {
            br.off(key)
        }
        
        let tr = freeze.tr;
        let tl = freeze.tl;
        let bl = freeze.bl;
        tr.dispose();
        tl.dispose();
        bl.dispose();
        document.getElementById("tr").remove();
        document.getElementById("tl").remove();
        document.getElementById("bl").remove();
        freeze = undefined;
    }
});

function selectionCleared(canvas) {
    canvas.discardActiveObject();
    canvas.renderAll();
}

function selectionCreated (canvas,evt) {
    let obj = find(canvas,evt.target.id);
    canvas._setActiveObject(obj);
    canvas.renderAll();
}

function selectionUpdated(canvas,evt) {
    let obj = find(canvas,evt.target.id);
    if (canvas.getActiveObject()?.id === obj.id) {
        return
    }
    canvas.setActiveObject(obj);
    canvas.renderAll();
}
function mouseWheel(canvas,ObjectsMoveMethod,ObjectsImgClipPathMethod) {
    canvas.discardActiveObject();
    canvas.getObjects().forEach(ObjectsMoveMethod);
    canvas.renderAll();
}

// todo  移动后重新选择
// todo 角度移动后 clippath切割的角度没变
function objectMoving(canvas,obj,moveOffset,imgClipPath) {
    // obj.hasControls = obj.hasBorders = false;
    obj.set(moveOffset);
    obj.clipPath = imgClipPath;
    obj.dirty = true;
    canvas.renderAll();
}

function find(canvas,id) {
    return canvas.getObjects().find(x=>x.id === id);
}
function reset(canvas,offsetMethod) {
    canvas.getObjects().forEach(offsetMethod);
    canvas.renderAll();

}
function createCanvas(parent,id,width,height,canvasData) {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.setAttribute("id",id);
    canvas.setAttribute("style",`position: absolute; left: 0; top: 0;z-index: 0;border: 1px solid green;`);
    parent.appendChild(canvas);
    let c =  new fabric.Canvas(id);
    c.loadFromJSON(canvasData,c.renderAll.bind(c));
    return c;
}
