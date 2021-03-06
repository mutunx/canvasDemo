var br = new fabric.Canvas('canvas');
var tl = null;
var tr = null;
var bl = null;
document.getElementsByClassName("canvas-container")[0].setAttribute("style","position:absolute")
const imgURL = `https://th.bing.com/th/id/OIP.28EBZUBR_BR6yOf7Gen8twAAAA?pid=ImgDet&rs=1`;
let freeze;
let btn = document.getElementById("btn");
let out = document.getElementById("out");


let rect4 = new fabric.Rect({
    deltaX:0,
    deltaY:0,
    id:1,
    width:150,
    height:150,
    left: 30,
    top: 30,
    fill:"royalblue",
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
        deltaX:0,
        deltaY:0,
        left:0,
        top:0,
    })
  
    br.add(img)
});
br.add(rect4);
br.add(rect4a);


function find(canvas,id) {
    return canvas.getObjects().find(x=>x.id === evt.target.id);
}

let events = {
    "object:rotating": (canvas,id) => {
        return (evt)=>{
            console.log("object:rotating")
            // let obj = canvas.getObjects().find(x=>x.id === evt.target.id);
            find(canvas,evt.target.id).set({
                left: evt.target.left,
                top: evt.target.top,
                angle: evt.target.angle,
            })
            canvas.renderAll();
        }
    },
    
    "object:moving": (canvas,id) => {
        return (evt)=>{
            
            console.log("object:moving")
            let obj = canvas.getObjects().find(x=>x.id === evt.target.id);
            let offsetX = 0;
            let offsetY = 0;
            switch(id) {
                case "tr":
                    offsetY = evt.target.deltaY;
                    break;
                case "bl": 
                    offsetX = evt.target.deltaX;
                    break;
                case "tl": 
                    offsetX = evt.target.deltaX;
                    offsetY = evt.target.deltaY;
                    break;
                
            } 
            
            obj.set({           
                left: evt.target.left - offsetX,  
                top: evt.target.top - offsetY, 
            })
            if (!!freeze) {
                if (id === "tl") {
                    canvas.renderAll();
                    return
                }
                let left =  100 - evt.target.left;
                left = left < 0 ? 0 : left;
                // obj.set("fill","red")
                let top = 100 - evt.target.top;
                top = top < 0 ? 0 : top;
                switch(id) {
                    case "tr":
                        top = 0;
                    case "bl": 
                        left = 0;
                }
                
                out.textContent = "left=" + left + " top=" + top
                obj.clipPath =  new fabric.Rect({
                    width: obj.width,
                    height: obj.height,
                    left: -(obj.width / 2) + left/evt.target.scaleX ,
                    top: -(obj.height / 2) + top /evt.target.scaleY,
                });
                out.textContent +="\n clipPath left" + -(obj.width / 2) + left/evt.target.scaleX;
                out.textContent +=" clipPath top" + -(obj.height / 2) + top/evt.target.scaleY;
                obj.dirty = true;
            }
            canvas.renderAll();
            br.renderAll();
        }
    },
    "object:scaling": (canvas,id) => {
        return (evt)=>{
            console.log("object:scaling")
            let obj = canvas.getObjects().find(x=>x.id === evt.target.id);
            obj.set({
                left: evt.target.left,
                top: evt.target.top,
                scaleX: evt.target.scaleX,
                scaleY: evt.target.scaleY,
            })
            canvas.renderAll();
        }
    },
    "selection:created" : (canvas,id) => {
        console.log("event selection:created")
        return (evt)=>{
            console.log("selection:created")
            if (!!!evt.e) return;
            if (evt.e.x < 100 || evt.e.y < 100) reset(evt);
            let obj = canvas.getObjects().find(x=>x.id === evt.target.id);
            canvas.setActiveObject(obj);
        }
    },
    "selection:cleared": (canvas,id) => {
        return (evt)=>{
            console.log("selection:cleared")
            canvas.discardActiveObject();
            canvas.renderAll();
        }
    },
    "selection:updated": (canvas,id) => {
        return (evt)=>{
            console.log("selection:updated")
            let obj = canvas.getObjects().find(x=>x.id === evt.target.id);
            if (canvas.getActiveObject()?.id === obj.id) {
                return
            }
            canvas.setActiveObject(obj);
            canvas.renderAll();
        }
    },
    //  ????????? ??????????????????????????????????????? ???????????????
    // ??????????????? ?????????????????????  ?????????????????????????????????
    "mouse:wheel": (canvas,id) => {
        return (evt)=>{

            let tr = freeze.tr;
            let tl = freeze.tl;
            let bl = freeze.bl;
            console.log("wheel")
            tl.discardActiveObject();
            tr.discardActiveObject();
            br.discardActiveObject();
            bl.discardActiveObject();
            let deltaX = evt.e.deltaX/10;
            let deltaY = evt.e.deltaY/10;
            br.getObjects().forEach(x=> x.set({
                left:x.left + deltaX,
                deltaX:x.deltaX + deltaX?? 0,
                top:x.top + deltaY,
                deltaY:x.deltaY + deltaY?? 0,
            }));
            tr.getObjects().forEach(x=> x.set({
                left:x.left + deltaX,
                deltaX:x.deltaX + deltaX?? 0,
                deltaY:x.deltaY + deltaY?? 0,
            }));
            bl.getObjects().forEach(x=> x.set({
                top:x.top + deltaY,
                deltaX:x.deltaX + deltaX?? 0,
                deltaY:x.deltaY + deltaY?? 0,
            }));
            tl.getObjects().forEach(x=> x.set({
                deltaX:x.deltaX + deltaX?? 0,
                deltaY:x.deltaY + deltaY?? 0,
            }));

            
            tr.getObjects().forEach(x=> {
                console.log(x.left,"->left tr top->",x.top)
                // console.log(x.aCoords?.tl)

                let left =  100 - x.left;
                left = left < 0 ? 0 : left;

                x.clipPath = new fabric.Rect({
                    width: x.width,
                    height: x.height,
                    left: -(x.width / 2) + left/x.scaleX ,
                    top: -(x.height / 2) ,
                });
                x.dirty = true;
                x.setCoords();
            });
            br.getObjects().forEach(x=> {
                console.log(x.left,"->left br top->",x.top);
                // console.log(x.aCoords?.tl)
                
                let left =  100 - x.left;
                left = left < 0 ? 0 : left;

                let top = 100 - x.top;
                top = top < 0 ? 0 : top;

                x.clipPath = new fabric.Rect({
                    width: x.width,
                    height: x.height,
                    left: -(x.width / 2) + left/x.scaleX ,
                    top: -(x.height / 2) + top /x.scaleY,
                });
                x.setCoords();
                x.dirty = true;
            });
            
            bl.getObjects().forEach(x=> {
                console.log(x.left,"->left bl top->",x.top)
                // console.log(x.aCoords?.tl)

                let top = 100 - x.top;
                top = top < 0 ? 0 : top;

                x.clipPath = new fabric.Rect({
                    width: x.width,
                    height: x.height,
                    left: -(x.width / 2),
                    top: -(x.height / 2) + top/x.scaleY ,
                });
                x.setCoords();
                x.dirty = true;
            });
            // let bro = br.getObjects().find(x=>x.id === evt.target.id);

            // if (!!!tro.aCoords || tro.aCoords?.tl.x >= 100) {
            //     return;
            // } 
            // tro.clipPath = new fabric.Rect({
            //     width: tro.width,
            //     height: tro.height,
            //     left: -(tro.width / 2) + (100 -tro.left) ,
            //     top: -(tro.height / 2),
            // });
            // bro.clipPath = new fabric.Rect({
            //     width: bro.width,
            //     height: bro.height,
            //     left: -(bro.width / 2) + (100 -tro.left),
            //     top: -(bro.height / 2),
            // });
            // tro.dirty = true
            // bro.dirty = true
            
            tl.renderAll();
            tr.renderAll();
            br.renderAll();
            bl.renderAll();
        }
    },
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

btn.addEventListener("click",() => {
    if (!!!freeze) {
        console.log("Frosting")
        let div = document.getElementById("div");

        let bl = createCanvas(div,"bl",100,400,JSON.stringify(br.toDatalessJSON(['id','deltaX','deltaY'])))
        let tr = createCanvas(div,"tr",400,100,JSON.stringify(br.toDatalessJSON(['id','deltaX','deltaY'])))
        let tl = createCanvas(div,"tl",100,100,JSON.stringify(br.toDatalessJSON(['id','deltaX','deltaY'])))

        
        for (let i = 0; i < document.getElementsByClassName("canvas-container").length;i++) {
            document.getElementsByClassName("canvas-container")[i].setAttribute("style","position:absolute")
        };
        // addEvents(tr,[tl,br,bl]);
        // addEvents(tl,[tr,br,bl]);
        // addEvents(br,[br,tl,tr,bl]);
        // addEvents(bl,[tl,br,tr]);
        addEvents2(tr,{tl:tl,br:br,bl:bl});
        addEvents2(tl,{tr:tr,br:br,bl:bl});
        addEvents2(br,{br:br,tl:tl,tr:tr,bl:bl});
        addEvents2(bl,{tl:tl,br:br,tr:tr});
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
        freeze = {};
    }
});
function addEvents(canvas,toCanvas) {
    if (!!! canvas) return;
    for (key of Object.keys(events)) {
        for (toC of toCanvas) {
            if (!!! toC) return;
            canvas.on(key,events[key](toC));
        }
    }
}

function addEvents2(canvas,toCanvas) {
    if (!!! canvas) return;
    for (key of Object.keys(events)) {
        for (toC of Object.keys(toCanvas)) {
            if (!!! toC) return;
            canvas.on(key,events[key](toCanvas[toC],toC));
        }
    }
}
function reset(evt) {
    br.getObjects().forEach(x=>{
        console.log(x.deltaX,"<-deltaX br deltaY->",x.deltaY,x.top,"<- top left->",x.left)
        x.set({
            left: x.left - x.deltaX?? 0, 
            top: x.top - x.deltaY?? 0,
            deltaX: 0,
            deltaY: 0,
        });
        x.setCoords();
        x.clipPath = null;
        x.dirty = true;
    });
    br.renderAll();
    if (!!!freeze) return;
    let tr = freeze.tr;
    let tl = freeze.tl;
    let bl = freeze.bl;
    tr.getObjects().forEach(x=>{
        console.log(x.deltaX,"<-deltaX tr deltaY->",x.deltaY,x.top,"<- top left->",x.left)
        x.set({
            left: x.left - x.deltaX?? 0, 
            top: x.top - x.deltaY?? 0,
            deltaX: 0,
            deltaY: 0,
        });
        // ???????????????????????????????????????
        x.setCoords();
        x.clipPath = null;
        x.dirty = true;
    });
    
    bl.getObjects().forEach(x=>{
        console.log(x.deltaX,"<-deltaX bl deltaY->",x.deltaY,x.top,"<- top left->",x.left)
        x.set({
            left: x.left - x.deltaX?? 0, 
            top: x.top - x.deltaY?? 0,
            deltaX: 0,
            deltaY: 0,
        });
        x.setCoords();
        x.clipPath = null;
        x.dirty = true;
    });
    tr.renderAll();
    
    bl.renderAll();

}
