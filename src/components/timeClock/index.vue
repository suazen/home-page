<template>
  <div class="clock">
    <div class="time">{{ currentTime }}</div>
    <div class="date">{{ currentDate }}</div>
    <div class="lunar">{{ lunarDate }}</div>
  </div>
</template>

<script>
import LunarCalendar from 'lunar-calendar'

export default {
  name: "time-clock",
  data() {
    return {
      currentTime: '',
      currentDate: '',
      lunarDate: ''
    }
  },
  mounted() {
    this.updateTime()
    setInterval(() => {
      this.updateTime()
    }, 1000)
  },
  methods: {
    updateTime() {
      const now = new Date()
      const year = now.getFullYear()
      const month = this.padZero(now.getMonth() + 1)
      const date = this.padZero(now.getDate())
      const day = now.getDay()
      const hour = this.padZero(now.getHours())
      const minute = this.padZero(now.getMinutes())
      const second = this.padZero(now.getSeconds())
      const week = ['日', '一', '二', '三', '四', '五', '六']
      const lunar = LunarCalendar.solarToLunar(year, month, date)
      this.currentTime = `${hour}:${minute}:${second}`
      this.currentDate = `${year}年${month}月${date}日 星期${week[day]} `+ (lunar.solarFestival || '')
      this.lunarDate = `农历${lunar.lunarMonthName}${lunar.lunarDayName} `+ (lunar.lunarFestival || '')
    },
    // 补零
    padZero(num) {
      return num < 10 ? '0' + num : num
    }
  }
}
</script>

<style>
.clock {
  font-size: 48px;
  text-align: center;
  margin-bottom: 50px;
  filter: invert(100%);
}
.time {
  font-weight: bold;
  font-size: 72px;
  font-family: sans-serif;
}
.date {
  font-size: 22px;
  font-family: sans-serif;
}
.lunar {
  font-size: 20px;
  font-family: sans-serif;
}
</style>