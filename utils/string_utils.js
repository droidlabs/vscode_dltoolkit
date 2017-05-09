module.exports = class StringUtils {
  // @option str [String], ex: entities/project_comment.rb
  // @return [String],     ex: Entities::ProjectComment
  static getRubyClassNameFromPath(str) {
    let tokens = str
      .replace(/.rb$/, '')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
      .split('/')

    return tokens
      .map(item => StringUtils.classify(item))
      .join('::')
  }  

  // @option str [String], ex: entities
  // @return [String],     ex: Entities
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // @option str [String], ex: project_comment
  // @return [String],     ex: ProjectComment
  static classify(str) {
    return str
      .split('_')
      .map(item => StringUtils.capitalize(item))
      .join('')
  }
}