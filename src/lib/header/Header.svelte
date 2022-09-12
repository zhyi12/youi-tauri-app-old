<header>
    <div class="user-info">张三</div>
    <span class="btn" on:click={()=>window.location.reload()}>刷新</span>
</header>

<style lang="scss">
	header {
      display: flex;
      justify-content: space-between;
      height: 2rem;
      background: white;
      border-bottom: 1px solid #ddd;

      .user-info{
        padding-left: 8px;
        line-height: 2rem;
        vertical-align: middle;
      }
	}
</style>
