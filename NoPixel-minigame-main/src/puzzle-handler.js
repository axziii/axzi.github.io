import { $, shuffleArray, delay, playSound } from './helpers.js'
import { generateRandomPuzzle, generateQuestionAndAnswer} from './puzzle-factory.js'
import { getPuzzleSvg } from './svg-factory.js'
import { translatePuzzle, translateQA } from './translator.js'

const progressBar = $('.answer-progress-bar')
const inputElement = $('.answer-input')

let puzzleTime = 7
let puzzleAmount = 12
let showNumbers = 4

// handles generating puzzle and returning result
export async function doPuzzle(){
    let shownNums = [];
    let tempNums = [];

    // reset from previous run
    $('.answer-section').classList.add('hidden')
    $(".number-container").innerHTML = ''

    //Generate squares and puzzles
    const squares = [...Array(puzzleAmount).keys()].map(i => {
        let square = document.createElement('div')
        square.id = `square-${i+1}`
        square.className = 'square'
        $('#number-container').appendChild(square)
        return square
    })
    const puzzles = [...Array(puzzleAmount)].map(() => generateRandomPuzzle())
      
    // generate numbers and display
    const nums = shuffleArray([...Array(puzzleAmount)].map((v, i) => i+1))

    // Tempoary copy of Numbers as we want to splice
    tempNums = [...nums];

    for (let x = 0; x<showNumbers; x++) {
        let r = Math.floor(Math.random()*(nums.length-x)); // pick a random index
        // remove it from the source and add it to the target
        shownNums.push(tempNums.splice(r, 1)[0]);
    }

    await displayNumbers(nums, shownNums)

    const metronome = (puzzleTime == 7) ? playSound('assets/metronome.mp3') : playSound('assets/long-metronome.mp3')

    // clear and focus input window
    $('.answer-section').classList.remove('hidden')
    inputElement.value = ''
    inputElement.focus()

    // activate time remaining countdown bar 
    
    progressBar.style.transition = ``
    progressBar.classList.remove('answer-progress-bar-shrink')
    await delay(0.1)
    progressBar.style.transition = `width ${puzzleTime*1000}ms linear`
    progressBar.classList.add('answer-progress-bar-shrink')
    

    // display puzzle in squares
    squares.forEach((square, i) => {
        square.style.backgroundColor = puzzles[i].colors['background']
        square.innerHTML =  getPuzzleSvg(puzzles[i])
    })

    // generate and display question
    const [question, answer] = generateQuestionAndAnswer(nums, puzzles, shownNums) 
    $('.answer-question').textContent = question.toUpperCase()

    // for learning purposes
    console.log(answer)

    return new Promise((resolve) => {

        // return written input and answer
        inputElement.addEventListener("keyup", (event) => {
            if (event.keyCode === 13) {
                metronome.pause()
                resolve([inputElement.value, answer])
            }
        });

        // return nothing by default if puzzleTime seconds go by
        delay(puzzleTime).then(() => {
            metronome.pause()
            resolve([null, answer])
        });
    });
}

async function displayNumbers(numbers, shownNum){

    // Switch to use N for the ID over i for easier call back when shrinking numbers
    numbers.forEach((n, i) => {
        if(shownNum.includes(n)){
            $('#square-' + (i+1)).innerHTML = `<div class="big-numbers can-shrink" id="num-${n}">${n}</div>`
            $('#square-' + (i+1)).classList.add(`actnum-${n}`);
        }
    });

    await delay(1.5)
    numbers.forEach(n => {
        if(shownNum.includes(n)){
            $('#num-' + (n)).classList.add('number-shrink')
        }
    });
    await delay(1.5)
}

// puzzle time settins
const timeRange = $('#speed-control')
const puzzleRange = $('#puzzle-control')
timeRange.addEventListener('input', () => puzzleTime = $('.time-display').textContent = timeRange.value)
puzzleRange.addEventListener('input', () => showNumbers = $('.puzzle-display').textContent = parseInt(puzzleRange.value))
