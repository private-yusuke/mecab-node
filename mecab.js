const childProcess = require('child_process')

/**
 * @class MeCab
 * @classdesc MeCabを用いた形態素解析をします。
 * @prop {string} command 実行するMeCabのコマンド。 フルパスで指定することもできますし、デフォルトのようにしてもいいです(裏ではshell上で実行されます)
 * @prop {string} execOptions `command`を実行するときのchild_processのためのオプションです。
 * @prop {string} commandOptions `command`につけるオプションです。
 */
class MeCab {
  /**
   * command プロパティと execOptions プロパティのデフォルト値を設定します。
   * @constructor
   */
  constructor () {
    this.command = 'mecab'
    this.execOptions = {}
    this.commandOptions = null
  }
  /**
   * MeCab コマンドの出力に対して変数名をそれぞれ設定します。
   * @param {string[]} data MeCab コマンドの出力を配列にパースしたオブジェクト。
   * @returns {object} 適切な変数名を設定したObject
   */
  parser (data) {
    if (data.length <= 8) return null
    else {
      return {
        kanji: data[0],
        lexical: data[1],
        compound: data[2],
        compound2: data[3],
        compound3: data[4],
        conjugation: data[5],
        inflection: data[6],
        original: data[7],
        reading: data[8],
        pronunciation: data[9] || ''
      }
    }
  }
  format (array) {
    const ress = []
    if (!array) return ress
    array.forEach(data => {
      var res = this.parser(data)
      if (res) ress.push(res)
    })
    return ress
  }
  /**
   * そのままでは扱いづらい MeCab コマンドの出力を配列にします。
   * @param {string} str MeCab コマンドの出力
   * @returns {string[]} MeCab コマンドの出力を配列にしたもの
   */
  parseMeCabResult (str) {
    return str.split('\n').map(line => {
      const arr = line.split('\t')
      if (arr.length === 1) return [line]
      else {
        return [arr[0]].concat(arr[1].split(','))
      }
    })
  }
  /**
   * MeCab コマンドを実行する際に使うコマンドの文字列を生成します。
   * @param {string} strin MeCab コマンドで形態素解析させる文章
   */
  getCommandString (strin) {
    return `${this.command}${this.commandOptions ? ' ' + this.commandOptions : ''}`
  }
  /**
   * 形態素解析を同期でします。
   * @param {string} strin MeCab コマンドで形態素解析させる文章
   */
  parseSync (strin) {
    const res = childProcess.execSync(this.getCommandString(), {
      input: strin,
      ...this.execOptions
    })
    return this.parseMeCabResult(String(res)).slice(0, -2)
  }
  /**
   * 分かち書きを同期でします。
   * @param {string} strin MeCab コマンドで分かち書きさせる文章
   */
  wakachiSync (strin) {
    const res = childProcess.execSync(this.getCommandString() + ' -Owakati', {
      input: strin,
      ...this.execOptions
    })
    let tmp = String(res).split('\n')
    return tmp.map(i => i.split(' '))
  }
}
module.exports = MeCab

