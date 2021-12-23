<template>
  <div class="home">
    <div class="card">
      <div class="card-avatar">
      </div>
       <div class="card-details">
          <div class="name"></div>
          <div class="occupation">教授</div>
          <div class="card-about">
             <div class="item">
                <span class="label">擅长</span>
             </div>
          </div>
          <div class="skills">
             <span class="value"></span>
          </div>
       </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      time: null
    };
  },
  methods: {
  },
  beforeCreate() {
    console.log('before create. \nAt this point, events and lifecycle have been initialized.')
  },
  created() {
    console.log('created')
  },
  beforeMount() {
    console.log('before mount'); 
  },
  mounted() {
    console.log('mounted');
  },
  beforeUpdate() {
    console.log('before update');
  },
  updated(){
    console.log('updated');
  },
  beforeDestroy() {
    console.log("before distroy")
  },
  destroyed() {
    console.log("distroyed")
  },
};
</script>

<style scoped>
.home * {
  box-sizing: border-box;
}

.home {
  position: fixed;
  top: 65px;
  height: 85vh;
  width: 100vw;
  padding: 1rem;
  display: grid;
  overflow: auto;
  place-items: center;
  font-family: 'Source Code Pro', monospace;
  text-rendering: optimizelegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.card { 
  width: calc(var(--card-size) * 1.586);
  height: var(--card-size);
  margin: 10px;
  border-radius: 0.75rem;
  box-shadow:  0 22px 70px 4px rgba(0,0,0,0.56), 0 0 0 1px rgba(0, 0, 0, 0.3);
  color: white;
  background: black;
  /*color: black;
  background: white;*/
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  align-items: center;
  will-change: transform;
  transition: transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
}
   
.card:hover {
  transform: scale(1.1);
  box-shadow:  0 32px 80px 14px rgba(0,0,0,0.36), 0 0 0 1px rgba(0, 0, 0, 0.3);
}

.card-details {
  padding: 1rem;
}

.name {
  font-size: 1.25rem;
}

.occupation {
  font-weight: 600;
  color: var(--primary);
}

.card-avatar {
  display: grid;
  place-items: center;
  padding: 20px;
}

.card-about {
  margin-top: 1rem;
  display: grid;
  grid-auto-flow: column;
}

.item {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}
.item .value {
  font-size: 1rem;
}

.item .label {
  margin-top: 0.15rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
}

.skills {
  display: flex;
  flex-direction: column;
  margin-top: 0.75rem;
}

.skills .label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary);
}

.skills .value {
  margin-top: 0.15rem;
  font-size: 0.75rem;
  line-height: 1.25rem;
}
</style>
