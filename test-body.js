
module.exports = async () => {
    await new Promise(resolve => setInterval(resolve, Number(process.env.TEST_WAIT) || 0))
    // return [
    //     // import lot of modules
    //     require('path').join(__dirname, __filename),
    //     require('crypto').createHmac('md5', '').update(__filename).digest('hex'),
    //     require('os').userInfo(),
    //     require('fs').stat('', () => {}),
    // ]
}