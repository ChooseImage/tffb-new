import Matter from 'matter-js';
import Paper from 'paper';
import bgImg from '../../cover-01.jpg';
import 'pathseg';

const SVG_PATH_SELECTOR = '#two-ppl';

let Engine = Matter.Engine;
let Render = Matter.Render;
let Body = Matter.Body;
let Runner = Matter.Runner;
let World = Matter.World;
let MouseConstraint = Matter.MouseConstraint;
let Mouse = Matter.Mouse;
let Composite = Matter.Composite;
let Bodies = Matter.Bodies;
let Constraint = Matter.Constraint;
let Svg = Matter.Svg;
let Vector = Matter.Vector;
let Vertices = Matter.Vertices;



    class Sketch {
        constructor(){
            this.time = 0;
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.mouse = {
                x:300,y:300
            }
            this.initPaper();
            this.createSvgBodies();
            this.physics();
            this.addObjects();
            this.mouseEvents();
            this.renderLoop();
        }

        createSvgBodies(){
            //console.log(this.paths);
            let svg1 = document.querySelector('#two-ppl > path');
            this.vertices = Svg.pathToVertices(svg1);
            //console.log(this.vertices);
                // let scaleFactor = 1;
                // vertices = Vertices.scale (vertices, scaleFactor, scaleFactor);
                // let svgBody = Bodies.fromVertices(
                //      0,
                //      0,
                //     [this.vertices]
                // );
                //Composite.add(this.engine.world, svgBody);
        }

        mouseEvents(){
            this.render.canvas.addEventListener('mousemove', (e)=>{
                this.mouse.x = e.clientX - this.cursor.positionPrev.x;
                this.mouse.y = e.clientY - this.cursor.positionPrev.y;
            })
        }

        physics(){
            // create engine
            this.engine = Engine.create(),
            this.world = this.engine.world;

            this.engine.gravity.x = 0;
            this.engine.gravity.y = 0;

                // create renderer
            this.render = Render.create({
                    element: document.querySelector('#container'),
                    engine: this.engine,
                    options: {
                        width: this.width,
                        height: this.height,
                        showVelocity: false
                    }
            });


            Render.run(this.render);
                
            // create runner
            this.runner = Runner.create();
            Runner.run(this.runner, this.engine);
        }

        addObjects(){

            // init paper path obj
            this.pp = new Paper.Path(this.vertices);
            this.pp.fillColor = '#ff0000';
            this.number = this.pp.segments.length;

            /*
            this.shadow = new Paper.Path(path);
            this.shadow.fillColor = '#00ff00';
            this.shadow.shadowBlur = 30;
            this.shadow.shadowColor = '#ff0000';
            */

            // Grouping for clipping mask
            this.group = new Paper.Group([this.pp]);
            this.group.clipped = true; // this sets the mask cliping 
            this.pp.clipped = true; // this sets the mask cliping 


            let img = new Image();
            img.onload = ()=>{
                let rasterImg = new Paper.Raster(img);
                rasterImg.fitBounds(Paper.view.bounds, true);
                this.group.addChild(rasterImg);
            }
            img.src = bgImg;


            this.circles = [];
            this.anchors = [];
            this.links = [];

            this.cursor = Bodies.circle(300, 300, 50,{
                isStatic: false
            });

            this.center = Bodies.circle(290, 250, 50,{
                isStatic: false
            });


            for (let i = 0; i<this.number; i++){
                this.circles.push(
                    Bodies.circle(
                        this.pp.segments[i].point.x + 200,
                        this.pp.segments[i].point.y + 100,
                        1,{
                            density: 0.005,
                            restitution: 0
                        }
                    )
                )
                this.anchors.push(
                    Bodies.circle(
                        this.pp.segments[i].point.x + 200,
                        this.pp.segments[i].point.y + 100,
                        1,{
                            density: 0.005,
                            restitution: 0
                        }
                    )
                )
            }

            for (let i = 0; i<this.number; i++){
                let next = this.circles[i+1] ? this.circles[i+1] : this.circles[0];
                this.links.push(
                    Constraint.create({
                        bodyA: this.circles[i],
                        bodyB: this.anchors[i],
                        stiffness: 1
                    })
                );

                this.links.push(
                    Constraint.create({
                        bodyA: this.circles[i],
                        bodyB: next,
                        stiffness: 1
                    })
                );

                this.links.push(
                    Constraint.create({
                        bodyA: this.circles[i],
                        bodyB: this.center,
                        stiffness: 1
                    })
                );
                let nextnext = this.circles[(i+2)%this.number];
                this.links.push(
                    Constraint.create({
                        bodyA: this.circles[i],
                        bodyB: nextnext,
                        stiffness: 1
                    })
                );
            }





            //World.add(this.engine.world, this.circles);
            World.add(this.engine.world, this.cursor);
            World.add(this.engine.world, this.links);
            World.add(this.engine.world, this.center);


        }

        initPaper(){
            this.paperCanvas = document.getElementById('paper');
            this.project = new Paper.Project(this.paperCanvas);
        }

        renderLoop(){
            this.time += 0.05;

            this.pp.smooth();
            //this.shadow.smooth();


            // Syncing up physics and paper render 
            for(let i=0; i < this.number; i++){
                this.pp.segments[i].point.x = this.circles[i].position.x;
                this.pp.segments[i].point.y = this.circles[i].position.y;
                //this.shadow.segments[i].point.x = this.circles[i].position.x;
                //this.shadow.segments[i].point.y = this.circles[i].position.y;

            }

            Body.translate(this.cursor,{
                x:this.mouse.x,
                y:this.mouse.y
            })
            window.requestAnimationFrame(this.renderLoop.bind(this));
        }
    }

    new Sketch();