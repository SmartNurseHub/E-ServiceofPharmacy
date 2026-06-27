const api = {

  async get(url){

    const res = await fetch(url);

    return await res.json();
  },

  async post(url, data){

    const res = await fetch(url,{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify(data)
    });

    return await res.json();
  }
};