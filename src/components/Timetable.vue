<template>
  <div id="container" :key="counter">
      <!-- ========== DATE & CLOCK ========== -->
      <div class="today" id="clock">
          <div id="date">{{date}}</div>
          <div id="time">{{time}}</div>
      </div>
      <div class="dash">
          <div id="left">
              <!-- ========== TIMETABLE ========== -->
              <table id="timetable">
                  <tr 
                      v-for="ako in todaysTimetable" 
                      v-bind:key="ako.id" 
                      v-bind:data-start="ako.start" 
                      v-bind:data-end="ako.end" 
                      class="row"
                  >
                      <td class="time"  style="border: 2px solid red;">{{format24HrTime(ako.start)}}</td>
                      <td class="ako">
                          <table class="splitClassesTable" v-for="splitClasses in ako.classes" :key="splitClasses.id">
                              <tr>
                                  <td>
                                      <span v-if="splitClasses.year" class="year">{{splitClasses.year}}</span>
                                      <br v-if="splitClasses.year">
                                      <span v-if="splitClasses.subject" class="subject">{{splitClasses.subject}}</span>
                                      <br v-if="splitClasses.subject">
                                      <p v-if="splitClasses.teacher" class="teacher">{{splitClasses.teacher}}</p>
                                  </td>
                              </tr>
                          </table>

                      </td>
                  </tr>
              </table>

          </div>
          <!-- ========== TIMER ========== -->
          <div id="right">
              <div id="timer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 260 250" width="100%" height="100%">
                      <rect x="5" y="5" width="250" height="250" fill="none" />
                      <circle cx="130" cy="155" r="120" stroke="lightgrey" stroke-width="20" fill="none" />
                      <circle cx="100" cy="125" r="120" stroke="limegreen" :stroke-dasharray="dasharray"
                          stroke-offset="600" stroke-width="20" fill="none" transform="rotate(270,130,125)" />
                      <text x="73" y="170" fill="grey"
                          font-size="40">{{ timerMinute | formatTime }}:{{ timerSecond | formatTime }}</text>
                  </svg>
              </div>
          </div>

      </div>
  </div>
</template>

<script>
  import { timetableData } from '@/lib/timetableData'
  import { DateTime } from "luxon";
  
  export default {
      name: 'Timetable',
      components: {},
      circumference: 2 * Math.PI * 120,
      data() {
          return {
              // clock (el: '#clock')
              clockTime: '',
              clockDate: '',

              //timetable (el: '#timetable')
              timetable: timetableData,
              currentStart: '',
              currentEnd: '',
              todaysTimetable: '',

              // timer (el: #timer)
              circumference: 2 * Math.PI * 120,
              state: 'stopped',
              timerMinute: 0,
              timerSecond: 0,
              timerProgress: 0,
              timeInSeconds: 0,
              timerRef: null,
              // timerInterval: '',

              // luxon
              now: DateTime.local(),

              // days running counter
              counter: 0,
              interval: null,

          }
      },
      created() {
          this.interval = setInterval(() => {
              this.now = DateTime.local()
              this.checkTime()
          } , 1000);
      },
      mounted() {
          this.checkTime()
          this.getTimetableData()
      },
      filters: {
          formatTime: function (value) {
              if (value >= 10) {
                  return value;
              }
              return "0" + value;
          }
      },
      computed: {
          // get date for title
          date() {return this.now.toFormat('EEEE d MMMM')},
          // get time for clock
          time() {return this.now.toFormat('hh:mm')},
          // ---- Set Timetable data
          
      },
      watch : {
          // update timetable data 1 min past midnight
          now (newVal) {
              if (newVal.toFormat('HH:mm:ss') == '00:01:00') {
                  this.getTimetableData()
              }
          }
      },
      methods: {
          getTimetableData () {
              var days = ['sunday','monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
              var day = new Date().getDay();
              var dayName = days[day]
              console.log("this.timetable",this.timetable)
              console.log("day name is: " + dayName)
              console.log("week: " + this.timetable[dayName])
              
              this.todaysTimetable = this.timetable[dayName]

              // this.todaysTimetable = this.timetable['test']
              // return this.special['openDay']
      
          },
          format24HrTime(hhmm) {
              var timeArray = hhmm.split(':')
              var hour = timeArray[0]
              var min = timeArray[1]
              var AmOrPm = hour >= 12 ? 'pm' : 'am';
              hour = (hour % 12) || 12;
              return hour + ":" + min + AmOrPm
          },
          combined() {return this.now.toFormat('HH:mm')}, 
          checkTime() {
              if (this.now.toFormat('HH') > 8 && this.now.toFormat('HH') < 16) {
                  if (this.timerMinute == 0 && this.timerSecond == 0) {
                      console.log("lessshgo")

                      var timetableRows = document.getElementsByClassName("row")
                      
                      //==== Check if within Start & End times from DOM row data attributes ====
                      for (var i = 0; i < timetableRows.length; i++) {

                          var start = timetableRows[i].dataset.start
                          var end = timetableRows[i].dataset.end

                          // highlight row if matches time 
                          if (this.combined() >= start && this.combined() < end) {
                              // highlight & scroll to row
                              timetableRows[i].classList.add("highlighted")
                              timetableRows[i].scrollIntoView();
                              // set timer
                              const endArray = end.split(':')            // result [10,20]
                              const endTimeInSecs = DateTime.fromObject({hour: endArray[0], minute: endArray[1]}).toFormat('X')
                              const nowInSecs = DateTime.local().toFormat('X')  
                              const remainingSeconds = endTimeInSecs - nowInSecs
                              // * START TIMER *
                              this.startTimer(remainingSeconds)
                          } else {
                              timetableRows[i].classList.remove("highlighted")
                          }
                      }
                  }
              }
          },
          startTimer(seconds) {
              console.log("received",seconds,"secs")
              this.stop()
              // this.timerMinute = minuteCount
              // this.timeInSeconds = Number(this.timerMinute) * 60 + Number(this.timerSecond)
              this.timeInSeconds = seconds
              this.timerMinute = Math.floor(seconds / 60);
              this.timerSecond = seconds - (this.timerMinute * 60)
              console.log("starting timer for ",this.timerMinute,"mins",this.timerSecond,"secs")
              this.start();
          },
          start() {
              this.state = "started";
              if (this.timerProgress == 0) {
                  this.timerProgress = this.$options.circumference;
              }
              this._tick();
              this.interval = setInterval(this._tick, 1000);
          },
          pause() {
              this.state = "paused";
              clearInterval(this.interval);
          },
          stop() {
              this.state = "stopped";
              clearInterval(this.interval);
              this.timerMinute = 0;
              this.timerSecond = 0;
              this.timerProgress = 0;
          },
          _tick: function () {
              //if second is 0 and minute is 0, clear the interval
              if (this.timerMinute == 0 && this.timerSecond == 0) {
                  this.stop()
              }
              //update progress
              let delta = (this.$options.circumference / this.timeInSeconds)
              if ((this.timerProgress - delta) < (delta / 2)) {
                  this.timerProgress = 0
                  
              } else {
                  this.timerProgress -= delta
              }
              //if second is not 0, just decrement second
              if (this.timerSecond !== 0) {
                  this.timerSecond--;
                  return;
              }
              //if second is 0 and minute is not 0, decrement minute and set second to 59
              if (this.timerMinute !== 0) {
                  this.timerMinute--;
                  this.timerSecond = 59;
              }
          },
          dasharray() {
              return this.timerProgress + " " + this.$options.circumference
          },
      }
  }
</script>

<style scoped lang="scss">
  @import url('https://fonts.googleapis.com/css2?family=Kanit:ital,wght@1,800&family=Merriweather+Sans:ital,wght@1,800&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
}

#container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;

  .today {
      width: 100%;
      height: 10%;
      display: flex;
      justify-content: space-around;
      font-size: 4rem !important;
      font-family: 'Kanit', sans-serif;
      text-transform: uppercase;
      letter-spacing: 3px;
  }
}

.reveal #container {
  height: 70vh;
}

.dash {
  margin-top: 50px;
  width: 100%;
  height: 90%;
  display: flex;

  #left {
      width: 70%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: scroll;

      table {
          border-collapse: separate;

          tr {
              padding: 10px 0px;

              td {
                  padding: 0px 15px !important;
                  border: none !important;
              }
          }
      }

      #timetable {
          height: 100%;
          width: 90%;
          margin: 0;
          border-collapse: collapse;
          font-family: monospace;

          .row {
              font-size: 12px !important;
              vertical-align: top;

              .ako {
                  display: flex;
              }
          }

          .highlighted {
              background-color: red;
              color: white;
              height: auto;
              font-size: 2rem !important;
              font-family: 'Kanit', sans-serif;
              text-transform: uppercase;
              letter-spacing: 3px;

              .ako {
                  text-align: center;
                  font-size: 1em;
                  height: 100%;
              }
          }
      }
  }

  #right {
      width: 40%;
      height: 100%;
      display: flex;
      justify-content: center;
      /* align-items: center; */

      #timer {
          width: 80%;
          height: 50%;
          font-family: 'Kanit', sans-serif;
          /* font-family: 'Merriweather Sans', sans-serif; */
      }
  }
}

.teacher {
  font-size: 0.5rem;
  margin: 5px 0px !important;
}

.splitClassesTable {
  width: auto;
  height: 100%;
  text-align: center;
}

</style>