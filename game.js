// the game itself
let game;

// global object with game options
let gameOptions = {
    // card width, in pixels
    cardWidth: 334,
    // card height, in pixels
    cardHeight: 440,
    // card scale. 1 = original size, 0.5 half size and so on
    cardScale: 0.7
}
window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: 0x000000,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: 750,
            height: 880
        },
        scene: playGame
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}

// two constants for better understanding of "UP" and "DOWN"
const UP = -1;
const DOWN = 1;
class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }
    preload() {

        // loading the sprite sheet with all cards
        this.load.spritesheet("cards", "cards5.png", {
            frameWidth: gameOptions.cardWidth,
            frameHeight: gameOptions.cardHeight
        });
    }
    create() {

        // can we swipe?
        this.canSwipe = true;

        // create an array with 23 integers from 0 to 22
        this.deck = Phaser.Utils.Array.NumberArray(0, 22);
        console.log(this.deck);

        // shuffle the array
        Phaser.Utils.Array.Shuffle(this.deck);

        // the two cards in game
        this.cardsInGame = [this.createCard(0), this.createCard(1)];

        // we already have card 0 and 1 in game so next card index is 2
        this.nextCardIndex = 2;

        // a tween to make first card enter into play
        this.tweens.add({
            targets: this.cardsInGame[0],
            x: game.config.width / 2,
            duration: 500,
            ease: "Cubic.easeOut"
        });

        // listener for player input
        this.input.on("pointerup", this.checkSwipe, this);
    }

    // method to create a card, given an index
    createCard(i) {

        // the card itself, a sprite created outside the stage, on the left
        let card = this.add.sprite(- gameOptions.cardWidth, game.config.height / 2, "cards", this.deck[i]);
        console.log(this.deck[0]);

        if (this.deck[0] == 1){
            console.log("1 - The Magician");
        }
        else if (this.deck[0] == 21){
            console.log("0 - The Fool");
        }
        else if (this.deck[0] == 2){
            console.log("2 - The Empress");
        }

        // scale the sprite
        card.setScale(gameOptions.cardScale);

        // return the card
        return card;
    }

    // method to check if player input was a swipe
    checkSwipe(e) {

        // can the player swipe?
        if(this.canSwipe) {

            // determine swipe time, "release" timestamp minus "press" timestamp
            let swipeTime = e.upTime - e.downTime;

            // determine swipe vector
            let swipe = new Phaser.Math. Vector2(e.upX - e.downX, e.upY - e.downY);

            // get the magnitude, or length, of swipe vector
            let swipeMagnitude = swipe.length();

            // reduce the vector to a magnitude of 1
            let swipeNormal = swipe.normalize();

            // we have a vertical swipe when:
            // * swipeMagnitude is bigger than 20, that is the player swiped for at least 20 pixels
            // * swipeTime is less than 1 second, gestures longer than one second can't be considered swipes
            // * the absolute value of the y component of the normal is 0.8
            if(swipeMagnitude > 20 && swipeTime < 1000 && Math.abs(swipeNormal.y) > 0.8) {

                // swiping down
                if(swipeNormal.y > 0.4) {
                    this.handleSwipe(DOWN);
                }

                // swiping up
                if(swipeNormal.y < -0.4) {
                    this.handleSwipe(UP);
                }
            }
        }
    }

    // method to handle a swipe, given the direction
    handleSwipe(direction) {

        // we are swiping so we can't swipe anymore
        this.canSwipe = false;

        // which card are we moving?
        let cardToMove = (this.nextCardIndex + 3) % 2;

        // set moving card vertical position
        this.cardsInGame[cardToMove].y += direction * gameOptions.cardHeight * gameOptions.cardScale * 1.1;


        // tween the card to move to the horizontal center of the stage...
        this.tweens.add({
            targets: this.cardsInGame[cardToMove],
            x: game.config.width / 2,
            duration: 200,
            ease: "Cubic.easeOut",
            callbackScope: this,
            onComplete: function() {

                // ... then wait a second or little more...
                this.time.addEvent({
                    delay: 1200,
                    callbackScope: this,

                    // ... then call moveCards method
                    callback: this.moveCards,
                });
            }
        })
    }

    // method to update cards position
    moveCards() {

        // moving the first card
        let cardToMove = this.nextCardIndex % 2;

        // tween the card outside of the stage to the right
        this.tweens.add({
            targets: this.cardsInGame[cardToMove],
            x: game.config.width + 2 * gameOptions.cardWidth * gameOptions.cardScale,
            duration: 500,
            ease: "Cubic.easeOut"
        });

        // moving the second card
        cardToMove = (this.nextCardIndex + 1) % 2;

        // tween the card to the center of the stage...
        this.tweens.add({
            targets: this.cardsInGame[cardToMove],
            y: game.config.height / 2,
            duration: 500,
            ease: "Cubic.easeOut",
            callbackScope: this,
            onComplete: function(){

                // ... then recycle the card which we moved outside the screen
                cardToMove = this.nextCardIndex % 2;
                this.cardsInGame[cardToMove].setFrame(this.deck[this.nextCardIndex]);
                this.nextCardIndex = (this.nextCardIndex + 1) % 52;
                this.cardsInGame[cardToMove].x = gameOptions.cardWidth * gameOptions.cardScale / -2;

                // now we can swipe again
                this.canSwipe = true;
            }
        });
    }
}
function reload() {
    location.reload();
}