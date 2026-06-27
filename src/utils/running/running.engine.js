const {
 getRunning,
 updateRunning
}=require("./running.repository");


const {
 formatRunning
}=require("./running.format");



let lock = Promise.resolve();



function executeLock(fn){

  lock = lock.then(fn);

  return lock;

}




async function nextRunning(prefix){

 return executeLock(async()=>{


    let current =
      await getRunning(prefix);


    let next =
      current + 1;



    await updateRunning(
      prefix,
      next
    );



    const refno =
      formatRunning(
        prefix,
        next
      );


    console.log(
      "NEXT REFNO =",
      refno
    );


    return refno;


 });


}



module.exports={
 nextRunning
};