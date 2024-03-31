const sleep = (time:number) =>
    // time in millisecs
    new Promise((resolve) => setTimeout(resolve,time));

export {sleep}
