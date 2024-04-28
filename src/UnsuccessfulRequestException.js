class UnsuccessfulRequestException extends Error {
  constructor(code, response) {
    super(response.errorMessage || response.children?.[0]?.value || response.errorCode || 'request failed');
    this.code = code;
    this.response = response;
    this.name = 'UnsuccessfulRequestException';
  }
}

module.exports = UnsuccessfulRequestException;
