<template>
  <div class="container">
    <iframe class="weather" scrolling="no" src="https://tianqiapi.com/api.php?style=ye&skin=durian&fontsize=18" frameborder="0" width="120" height="75" allowtransparency="true"></iframe>
    <div>
      <time-clock></time-clock>
      <div class="search-box">
        <el-autocomplete
            ref="searchBox"
            v-model="searchText"
            :fetch-suggestions="querySearchAsync"
            @select="search"
            style="width: 50vh"
            @keyup.enter.native="search"
            placeholder="输入搜索内容...">
          <template slot="prepend">
            <el-select v-model="searchEngine" >
              <el-option v-for="engine in searchEngines" :key="engine.name" :value="engine.url" :label="engine.name"></el-option>
            </el-select>
          </template>
          <template slot-scope="{ item }">
            <div style="display: flex;justify-content: space-between;">{{ item.value }}
              <el-link v-if="item.remove" :underline="false" @click.stop="removeHistory(item.value)"><i class="el-icon-close el-icon--right"></i></el-link>
            </div>
          </template>
          <el-button slot="append" icon="el-icon-search" @click="search">Search</el-button>
        </el-autocomplete>
      </div>
    </div>
    <div class="website-icons">
      <el-popover
          v-for="(website) in websites" :key="website.id"
          title="编辑网站"
          placement="top"
          width="300"
          trigger="manual"
          v-model="website.popVisible">
        <el-form v-model="site" label-width="80px">
          <el-form-item prop="name" label="网站名称">
            <el-input v-model="site.name" placeholder="请输入网站名称"></el-input>
          </el-form-item>
          <el-form-item prop="url" label="网站地址">
            <el-input v-model="site.url" placeholder="请输入网站地址"></el-input>
          </el-form-item>
          <el-form-item prop="icon" label="网站图标">
            <el-input v-model="site.icon" :placeholder="`${site.url || 'http://example.com'}/favicon.ico`"></el-input>
          </el-form-item>
        </el-form>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="resetForm(website)">取消</el-button>
          <el-button type="primary" size="mini" @click="saveSite(website)">确定</el-button>
        </div>
        <a slot="reference" :href="website.url" target="_blank" @contextmenu.prevent="onContextmenu($event,website)">
          <el-avatar :size="60" :src="website.icon || `${website.url}/favicon.ico`" :alt="website.name" @error="iconErrorHandler" fit="scale-down">
            {{website.name}}
          </el-avatar>
        </a>
      </el-popover>
      <el-popover
          title="添加网站"
          placement="top"
          width="300"
          v-model="popVisible">
        <el-form v-model="site" label-width="80px">
          <el-form-item prop="name" label="网站名称">
            <el-input v-model="site.name" placeholder="请输入网站名称"></el-input>
          </el-form-item>
          <el-form-item prop="url" label="网站地址">
            <el-input v-model="site.url" placeholder="请输入网站地址"></el-input>
          </el-form-item>
          <el-form-item prop="icon" label="网站图标">
            <el-input v-model="site.icon" :placeholder="`${site.url || 'http://example.com'}/favicon.ico`"></el-input>
          </el-form-item>
        </el-form>
        <div style="text-align: right; margin: 0">
          <el-button size="small" type="text" @click="resetForm()">取消</el-button>
          <el-button type="primary" size="small" @click="saveSite()">确定</el-button>
        </div>
        <a slot="reference"><el-avatar :size="60" icon="el-icon-plus" style="background: yellowgreen"></el-avatar></a>
      </el-popover>
    </div>
    <el-tooltip effect="dark" content="点我打开ChatGPT" placement="bottom">
      <img
          src="../assets/openai.png"
          alt="avatar"
          class="openai-avatar"
          @click="gptVisible = true"
      />
    </el-tooltip>
    <el-drawer
        title="ChatGPT"
        :with-header="false"
        :visible.sync="gptVisible"
        direction="rtl"
        :size=400
        ref="drawer"
    >
      <iframe src="https://gpt.icola.fun" style="border: none;width: 100%;height: 99%"></iframe>
    </el-drawer>
  </div>
</template>

<script>
import TimeClock from "@/components/timeClock/index.vue";

export default {
  name: "hello-world",
  components: {TimeClock},
  data() {
    return {
      searchText: '',
      searchEngine: '',
      searchEngines: [{
        name: '谷歌',
        url: 'https://www.google.com/search?q='
      },{
        name: '必应',
        url: 'https://cn.bing.com/search?q='
      }],
      suggestions: [],
      hisList: [],
      gptVisible: false,
      popVisible: false,
      site: {
        name: '',
        url: '',
        icon: '',
        popVisible: false
      },
      websites: []
    }
  },
  mounted() {
    this.websites = JSON.parse(localStorage.getItem("websites")||'[]')
    this.searchEngine = this.searchEngines[0].url
  },
  methods: {
    search() {
      if (!this.searchText){
        return
      }
      this.saveHistory()
      window.open(this.searchEngine + this.searchText, '_blank')
      this.searchText = ''
    },
    querySearchAsync(queryString, cb) {
      if (queryString) {
        this.$http.jsonp('http://suggestion.baidu.com/su',{
          params:{
            wd: queryString
          },
          jsonp:'cb'
        }).then(res => {
          const suggestions = []
          res.data?.s.forEach(s => {
            suggestions.push({
              value: s
            })
          })
          cb(suggestions);
        });
      } else {
        const hisList = this.getHistory()
        cb(hisList)
      }
    },
    getHistory() {
      if (this.hisList.length === 0){
        this.hisList = JSON.parse(localStorage.getItem("history") || "[]")
      }
      return this.hisList
    },
    saveHistory() {
      this.hisList = this.hisList.filter(s => {
        return s.value !== this.searchText
      })
      this.hisList.unshift({
        value: this.searchText,
        remove: true
      })
      localStorage.setItem("history",JSON.stringify(this.hisList))
    },
    removeHistory(value) {
      this.hisList = this.hisList.filter(s => {
        return s.value !== value
      })
      localStorage.setItem("history",JSON.stringify(this.hisList))
      this.$refs.searchBox.suggestions = this.hisList
    },
    iconErrorHandler() {
      return true
    },
    saveSite(website) {
      if (website){
        website.name = this.site.name
        website.url = this.site.url
        website.icon = this.site.icon
        website.id = new Date().getTime()
        website.popVisible = false
      }else {
        this.site.id = new Date().getTime()
        this.websites.push(this.site)
        this.popVisible = false
      }
      localStorage.setItem("websites",JSON.stringify(this.websites))
    },
    resetForm(website) {
      if (website){
        website.popVisible = false
      }else {
        this.popVisible = false
      }
      this.site = {}
    },
    onContextmenu(event,website) {
      this.$contextmenu({
        items: [
          {
            label: "编辑",
            icon: "el-icon-edit",
            divided: true,
            onClick: () => {
              website.popVisible = true
              this.site = {...website}
            }
          },
          { label: "删除",
            icon: "el-icon-delete",
            onClick: ()=> {
              this.websites = this.websites.filter(s => {
                return s.id !== website.id
              })
              localStorage.setItem("websites",JSON.stringify(this.websites))
            }
          }
        ],
        event,
        zIndex: 3,
        minWidth: 100
      });
      return false;
    }
  }
}
</script>

<style>
.container {
  background: url("https://api.kdcc.cn/img/bingimg/dayimg.jpg") rgba(0, 0, 0, .2) no-repeat center center;
  background-blend-mode: multiply;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  flex-direction: column;
}

.search-box {
  display: flex;
  align-items: center;
  margin-bottom: 80px;
}

.search-box input {
  /*width: 300px;*/
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  margin-right: 10px;
}

.search-box button {
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.website-icons {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 200px;
  background: rgb(220,220,220,0.5);
  border-radius: 15px;
  padding: 10px;
  flex-direction: row;
  flex-wrap: wrap;
  width: 480px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.website-icons a {
  display: flex;
  align-items: center;
  justify-content: center;
  /*width: 50px;*/
  /*height: 50px;*/
  /*margin-right: 10px;*/
  /*border-radius: 50%;*/
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  padding: 10px;
  text-decoration:none;
}

.website-icons a:hover {
  transform: scale(1.1);
}

.website-icons img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.openai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 10px;
  position: fixed;
  right: 40px;
  top: 40px;
  cursor: pointer;
  filter: invert(1);
}

.weather {
  position: absolute;
  left: 36px;
  top: 36px;
  background: rgb(220,220,220,0.5);
  border-radius: 15px;
  padding: 10px 0 0 20px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.el-select .el-input {
  width: 80px;
}
.input-with-select .el-input-group__prepend {
  background-color: #fff;
}

</style>  