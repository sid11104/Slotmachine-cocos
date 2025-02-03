cc.Class({
    extends: cc.Component,

    properties: {
        maskNode: cc.Node,       
        reelContainer: cc.Node,  
        spritePrefab: cc.Prefab, 
        speedSlider: cc.Slider,  
        startButton: cc.Button,  
        stopButton: cc.Button,   
    },

    onLoad() {
        this.spacing = 10; 
        this.numSprites = 20; 
        this.scrollSpeed = 0; 
        this.maxSpeed = 800; 
        this.minSpeed = 30; 
        this.spriteHeight = 100; 
        this.isSpinning = false;
        this.isStopping = false;
        this.initialOffset = 175;

        this.initReel();

        this.startButton.node.on("click", this.startSpin, this);
        this.stopButton.node.on("click", this.stopSpin, this);
        this.speedSlider.node.on("slide", this.adjustSpeed, this);
    },

    initReel() {
        for (let i = 0; i < this.numSprites; i++) {
            this.addSprite(i);
        }
    },

    addSprite(index) {
        let sprite = cc.instantiate(this.spritePrefab);
        sprite.parent = this.reelContainer;
        sprite.setPosition(0, (-index * (this.spriteHeight + this.spacing) + this.initialOffset));
    },

    startSpin() {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.isStopping = false;

        cc.tween(this)
            .to(1, { scrollSpeed: this.maxSpeed }, { easing: "quadOut" })
            .start();

        this.schedule(this.scrollReel, 0);
    },

    scrollReel(dt) {
        if (!this.isSpinning) return;

        this.reelContainer.y -= this.scrollSpeed * dt;

        for (let i = 0; i < this.reelContainer.children.length; i++) {
            let child = this.reelContainer.children[i];

            if (child.y + this.reelContainer.y < -this.reelContainer.height / 2 - this.spriteHeight) {
                let highestY = this.getHighestSymbolY();
                child.y = highestY + this.spriteHeight + this.spacing;
            }
        }
    },

    getHighestSymbolY() {
        let highestY = -Infinity;
        for (let i = 0; i < this.reelContainer.children.length; i++) {
            let child = this.reelContainer.children[i];
            highestY = Math.max(highestY, child.y);
        }
        return highestY;
    },

    stopSpin() {
        if (!this.isSpinning || this.isStopping) return;

        this.isStopping = true;

        cc.tween(this)
            .to(1.5, { scrollSpeed: this.minSpeed }, { easing: "quadOut" })
            .call(() => this.alignToNearest()) 
            .start();
    },

    alignToNearest() {
        let closestIndex = Math.round(this.reelContainer.y / (this.spriteHeight + this.spacing));
        let targetY = closestIndex * (this.spriteHeight + this.spacing);

        cc.tween(this.reelContainer)
            .to(0.5, { y: targetY }, { easing: "quadOut" })
            .call(() => {
                this.isSpinning = false;
                this.isStopping = false;
            }) 
            .start();
    },

    adjustSpeed(slider) {
        this.scrollSpeed = 50 + slider.progress * 800;
    },
});
