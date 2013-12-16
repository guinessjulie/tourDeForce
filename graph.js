// ==ClosureCompiler==
// @output_file_name default.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

/**************************************************************************/
/************* CRAYON ******************/
/**************************************************************************/
function Crayon() {}
Crayon.drawText = function (x, y, txt, font, ctx) {
    ctx.font = font;
    ctx.fillStyle = '#eee';
    ctx.fillText(txt, x, y);
}

Crayon.drawCircle = function (x, y, r, color, ctx) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}


Crayon.drawLine = function (x1, y1, x2, y2, color, ctx) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.stroke();
}

/**************************************************************************/
/************** GRAPH ****************************/
/**************************************************************************/

function Graph(id, width, height, stiffness, repulsion, damping) {
    var _height = height;
    var _width = width;
    var _damping = typeof damping !== 'undefined' ? damping : 0.1;
    var _k = typeof stiffness !== 'undefined' ? stiffness : 0.35;
    var _repulsion = typeof repulsion !== 'undefined' ? repulsion : 50;

    var _c = new Canvas(id, width, height);
    var _ctx = _c.getContext();
    var _nodeList = [];
    var _adjencyList = [];
    var _randomCoord = function (max) {
        return Math.floor(Math.random() * max);
    }

    this.addVertice = function (key1, key2) {
        _adjencyList.push(new Vertice(_nodeList[key1], _nodeList[key2]));
    }

    this.addNode = function (key, m) {
        _nodeList[key] = new Node(key, _randomCoord(_width), _randomCoord(_height), m);
    }

    this.nodeList = function () {
        for (var key in _nodeList)
        console.log(_nodeList[key].toString());
    }

    this.draw = function () {
        _ctx.clearRect(0, 0, _width, _height);
        _ctx.fillStyle = "#111";
        _ctx.fillRect(0, 0, width, height);
        for (var key in _adjencyList) {
            _adjencyList[key].draw(_ctx);
        }

        for (var key in _nodeList) {
            _nodeList[key].draw(_ctx);
        }

    }
    this.coulombRepulsion = function (node1, node2) {

        //F = -kx;
        var d = Math.sqrt(Math.pow(node1.x() - node2.x(), 2) + Math.pow(node1.y() - node2.y(), 2));
        if (d == 0) d = 0.001;

        var Ox = (node1.x() - node2.x()) / 2 + node1.x()
        var Oy = (node1.y() - node2.y()) / 2 + node1.y()

        var angleX = node1.x() - Ox;
        var angleY = node1.y() - Oy;
        var angle = 0;
        if (angleX > 0) {
            angle = Math.atan(angleY / angleX);
        } else if (angleX < 0) {
            angle = Math.atan(angleY / angleX) + Math.PI;
        } else if (angleX == 0 & angleY > 0) {
            angle = Math.PI / 2;
        } else if (angleX == 0 & angleY < 0) {
            angle = 3 * Math.PI / 2;
        }


        var vector = [];
        vector[0] = -_repulsion * Math.pow(node1.m() * node2.m(), 2) / Math.pow(d, 2);
        vector[1] = angle;
        return vector;

    }
    this.hookeAttraction = function (node, vertice) {
        //F = -kx;
        var node1 = node;
        var node2 = _nodeList[vertice.getNode1()] == node1.toString() ? _nodeList[vertice.getNode2()] : _nodeList[vertice.getNode1()];
        var d = Math.sqrt(Math.pow(node1.x() - node2.x(), 2) + Math.pow(node1.y() - node2.y(), 2));

        if (d == 0) d = 0.001;

        var Ox = (node1.x() - node2.x()) / 2 + node1.x()
        var Oy = (node1.y() - node2.y()) / 2 + node1.y()

        var angleX = node1.x() - Ox;
        var angleY = node1.y() - Oy;
        var angle = 0;
        if (angleX > 0) {
            angle = Math.atan(angleY / angleX);
        } else if (angleX < 0) {
            angle = Math.atan(angleY / angleX) + Math.PI;
        } else if (angleX == 0 & angleY > 0) {
            angle = Math.PI / 2;
        } else if (angleX == 0 & angleY < 0) {
            angle = 3 * Math.PI / 2;
        }

        var vector = [];
        vector[0] = _k * d;
        vector[1] = angle;
        return vector;
    }

    this.update = function () {
        var kineticEnergy = 0;
        for (var key in _nodeList) {
            var netForceX = 0;
            var netForceY = 0;
            
            for (var key2 in _nodeList) {
                if (key != key2) {
                    var vector = this.coulombRepulsion(_nodeList[key], _nodeList[key2]);
                    netForceX += Math.cos(vector[1]) * vector[0];
                    netForceY += Math.sin(vector[1]) * vector[0];

                }
            }

            for (var verticeKey in _adjencyList) {
                if (_adjencyList[verticeKey].getNode1() == key || _adjencyList[verticeKey].getNode2() == key) {
                    var vector = this.hookeAttraction(_nodeList[key], _adjencyList[verticeKey]);
                    netForceX += Math.cos(vector[1]) * vector[0];
                    netForceY += Math.sin(vector[1]) * vector[0];
                }
            }

            _nodeList[key].setVelocityX((_nodeList[key].velocityX() + netForceX) * _damping);
            _nodeList[key].setVelocityY((_nodeList[key].velocityY() + netForceY) * _damping);
            _nodeList[key].setX(_nodeList[key].x() + _nodeList[key].velocityX());

            _nodeList[key].setY(_nodeList[key].y() + _nodeList[key].velocityY());
        }
    }

    this.run = function () {
        var FPS = 30;
        setInterval(function () {
            graph.update();
            graph.draw();
        }, 1000 / FPS);
    }

}

/**************************************************************************/
/************** Canvas ***************/
/**************************************************************************/
function Canvas(id, width, height) {
    var _width = width;
    var _height = height;
    var _canvas = document.getElementById(id);
    var _ctx = _canvas.getContext("2d");

    this.getContext = function () {
        return _ctx;
    };
    document.getElementById(id).width = _width;
    document.getElementById(id).height = _height;

    _ctx.fillStyle = "#111";
    _ctx.fillRect(0, 0, width, height);
}

/**************************************************************************/
/********************************* Vertice **********************/
/**************************************************************************/
function Vertice(key1, key2) {
    var _node1 = key1;
    var _node2 = key2;
    var _color = "hsl(" + Math.random() * 360 + ", 60%, 60%)";

    this.getNode1 = function () {
        return _node1
    };
    this.getNode2 = function () {
        return _node2
    };
    this.draw = function (ctx) {
        Crayon.drawLine(_node1.x(), _node1.y(), _node2.x(), _node2.y(), _color, ctx)
    }

}
/**************************************************************************/
/*********************************Node **********************/
/**************************************************************************/
function Node(label, x, y, m) {
    var _x = x;
    var _y = y;
    var _velocityX = 0;
    var _velocityY = 0;
    var _label = label;
    var _m = typeof m !== 'undefined' ? m : 15;
    var _color = "hsl(" + Math.random() * 360 + ", 60%, 60%)";
    this.toString = function () {
        return _label;
    };

    this.draw = function (ctx) {
        Crayon.drawCircle(_x, _y, 20, _color, ctx);
        Crayon.drawText(_x, _y, _label, "20px Arial", ctx);
    }
    this.x = function () {
        return _x;
    }
    this.y = function () {
        return _y;
    }
    this.m = function() {
        return _m;
    }

    this.setX = function (x) {
        _x = x
    }
    this.setY = function (y) {
        _y = y
    }

    this.velocityX = function () {
        return _velocityX
    }
    this.velocityY = function () {
        return _velocityY
    }

    this.setVelocityX = function (x) {
        _velocityX = x
    }
    this.setVelocityY = function (y) {
        _velocityY = y
    }
}

