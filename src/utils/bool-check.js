function boolCheck(plainText) {
    let value = false
    const string = plainText.toLowerCase()

    if (string === 'true') {
        value = true
    } else {
        value = false
    }
    
    return value
}

module.exports = boolCheck