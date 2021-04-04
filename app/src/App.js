import React from "react";
import { Stage, Layer, RegularPolygon, Text, Line, Circle} from 'react-konva';
import {Card, Form, Button} from "react-bootstrap";
import _, { includes } from 'lodash'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import songs_ from '../public/songs.json'
import words_ from '../public/words.json'

// GLOBALS 
// Transform and Filter
const SONGS = _.chain(songs_)
        // .map((s) => {return (s.toUpperCase())})
        .filter((s) => { return (new Set(_.filter(s, (c) => {return (/^[a-zA-Z]$/.test(c))})).size < 10) })
        .value()
const WORDS = _.filter(words_, (w) => {return w.length > 3})



function TextInput(props) {

  return (
    <div id='textInputDiv'>
      <Form onKeyPress={props.formSubmit}>
        <Form.Group>
          <Form.Control id='textInput' ize="lg" type="text" placeholder="Input Word" autoComplete="off"/>
        </Form.Group>
        <Button id='submitButton' className='topButton' variant="dark" size="lg" type="submit" onClick={props.formSubmit}>
          Submit
        </Button>
        <Button id='newGame' className='topButton' variant="info" size="lg" type="submit" onClick={props.newGame}>
          New Game
        </Button>
      </Form>
    </div>
  )
}

function ScoreBox(props) {
  console.log('SCORE ', props)
  return (
    <Card id='scoreBox' className="text-center">
      <Card.Header><Card.Title>Score</Card.Title></Card.Header>
      <Card.Body>
        {props.scores.map((score, i) => {
          return <Card.Text key={"score" + i}> {score.word} :  <span style={{color:'firebrick'}}><b>{score.value}</b></span> </Card.Text>
        })}
      </Card.Body>
      <Card.Footer className="text-muted">
        <Card.Text key='totalNum'>Total Num Words: {props.scores.length} </Card.Text>
        <Card.Text key='totalScore'>Total Score: {_.reduce(props.scores, (total, score) => {return (total + score.value)}, 0)} </Card.Text>
      </Card.Footer>
  </Card>
  )
}

class Letters extends React.Component {

  hexagon_(x, y, key){
    let radius = this.props.radius
    return (
        <RegularPolygon
              sides={6}
              stroke='black'
              fillEnabled='true'
              fill='floralwhite'
              radius={radius}
              x={x}
              y={y}
              key={key}
              onClick={this.props.onLetterClick}
        />)
  }

  text_(x,y, text, key){
    return (
      <Text
        x={x}
        y={y}
        text={text}
        fontSize={this.props.fontsize}
        fontFamily='Calibri'
        fill='cadetblue'
        key={key}
        onClick={this.props.onLetterClick}
      />)
  }

  buildHexagons(){
    let game = this.props.game
    let {width, height} = {width: document.body.clientWidth/2, height: document.body.clientWidth/2}
    let charset = this.props.game.charset 
    let nLetters = charset.length
    let radius = this.props.radius
    // https://calcresource.com/geom-hexagon.html#anchor-14
    let rInner = Math.sqrt(3)*radius/2
    let startPoint = {x: width/(Math.floor(nLetters/4) + 2), y: height/2}

    const fontsize = this.props.fontsize

    // Minimum 4 letters
    let hexagons = [
      this.hexagon_(startPoint.x, startPoint.y,'hex-0'),
      this.text_(startPoint.x - fontsize/3, startPoint.y - fontsize/3, charset[0], 'txt-0')
    ]

    for (let i = 1; i < nLetters; i++ ){
      if (i % 3 == 0){
        hexagons = hexagons.concat([
          this.hexagon_(startPoint.x + (Math.floor(i/3) * 2 - 1) * rInner, startPoint.y + radius*1.5, 'hex-'+i),
          this.text_(
            startPoint.x + (Math.floor(i/3) * 2 - 1) * rInner - fontsize/3, 
            startPoint.y + radius * 1.5 - fontsize/3,
            charset[i],
            'txt-'+i)
        ])
      }
      else if (i % 3 == 2){
        hexagons = hexagons.concat([
          this.hexagon_(startPoint.x + (Math.floor(i/3) * 2 + (i%3)) * rInner, startPoint.y, 'hex-'+i), 
          this.text_(
            startPoint.x + (Math.floor(i/3) * 2 + (i%3)) * rInner - fontsize/3, 
            startPoint.y - fontsize/3,
            charset[i],
            'txt-'+i)
        ])
      }
      else {
        hexagons = hexagons.concat([
          this.hexagon_(startPoint.x + (Math.floor(i/3) * 2 + (i%3)) * rInner, startPoint.y - radius * 1.5, 'hex-'+i),
          this.text_(
            startPoint.x + (Math.floor(i/3) * 2 + (i%3)) * rInner - fontsize/3, 
            startPoint.y - radius * 1.5 - fontsize/3,
            charset[i],
            'txt-'+i)
        ])
      }
    }
    return hexagons
    

  }

  render() {
    // console.log(document.body.clientWidth, document.body.clientWidth)
    return (
      <div id='letters'>
        <Stage width={document.body.clientWidth/2} height={document.body.clientWidth/2}>
          <Layer>
            {this.buildHexagons()}
          </Layer>
        </Stage>
      </div>
    )
  }
}

class App extends React.Component {

  constructor(props) {
    super(props)

    let game = this.makeGame()
    this.state = {game: game}

  }

  componentDidMount() {
    this.newGame()
  }

  showGame() {
    console.log("STATE")
    console.log(this.state)


    
    // audio.crossOrigin = 'anonymous'

    // audio.src = "https://s3.amazonaws.com/dadgrams.beatles/dadsongs/A+Hard+Day's+Night.m4a"
    // audio.addEventListener("canplaythrough", event => {
    //   /* the audio is now playable; play it if permissions allow */
    //   audio.play().then((s) => console.log(S), (r) => console.log(r));
    // });
  }

  onLetterClick(e) {
    let f = document.querySelector('#textInput')
    f.value = f.value + e.target.attrs.text
  }

  newGame(){
    var game = this.makeGame()
    var audio = new Audio("https://s3.amazonaws.com/dadgrams.beatles/dadsongs/" + game.titleUrl + ".m4a");
    this.setState({
      game: game,
      audio: audio
    })
  }

  makeGame() {
    let title = SONGS[Math.floor(Math.random() * SONGS.length)]
    let titleUrl = title.replace(/ /g, '+')
    title = title.toUpperCase()


    let clean_title = title.replace(/[\.,-\/#!$%\^&\*;:{}=\-_'`~()@\+\?><\[\]\+]/g, '').replace(/\s{2,}/g," ");
    let charset = new Set(_.filter(title, (c) => /^[a-zA-Z]$/.test(c)))
    charset = _.shuffle(Array.from(charset))
    let center = charset[Math.floor(Math.random() * charset.length)]
    let valid_words = _.filter(WORDS, (word) =>  _.every(word, (c) => _.includes(charset, c))) //_.includes(word, center) && 
    return ({
      'charset': charset, 
      'center' : center, 
      'words': valid_words,
      'title': title,
      'titleUrl': titleUrl,
      'clean_title': clean_title,
      'max_score': _.reduce(valid_words, (a,b) => {return (a + b.length)}, 0) + 50, // title is worth 50
      'score': []
    }) 
  }

  textSubmit(txt){
    var word = txt.toUpperCase()
    let game = this.state.game

    if (_.includes(_.map(game.score, (s) => s.word), word)) {
      alert("You already guessed that word!")
      return
    }
    else if (word == game.clean_title) {
      console.log(word, ' is worth 50 points!')
      game.score.push({word: word, value: 50})
      this.state.audio.play()
    }
    else if (_.includes(game.words, word)) {
      console.log(word, ' is worth ', word.length,  ' points!')
      game.score.push({word: word, value: word.length})
    }
    else {
      alert(word + ' is not a valid word')
    }
    this.setState({game})
  }

  formSubmit(e) {
    if (e.key == 'Enter') {
      e.preventDefault()
      this.textSubmit(e.target.value)
      e.target.value = null
    }
    if (e.target.id == 'submitButton'){
      e.preventDefault()
      let txt = document.getElementById('textInput').value
      this.textSubmit(txt)
    }
  }
  

  render() {
    return (
      <div id='gameBody'>
        <TextInput formSubmit={this.formSubmit.bind(this)} newGame={this.newGame.bind(this)}></TextInput>
        <div id='middle'>
          <Letters key='letters' fontsize={35} game={this.state.game} radius={50} onLetterClick={this.onLetterClick.bind(this)}></Letters>
          <ScoreBox scores={this.state.game.score}></ScoreBox>
        </div>
        <button onClick={this.showGame.bind(this)}>Show State</button>
      </div> 
    )
  }
}
//scores={this.state.game.scores}

export default App


