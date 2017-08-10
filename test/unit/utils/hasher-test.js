var expect = require('expect.js');
var path = require('path');

describe('unit - hasher', function () {

    this.timeout(30000);

    context('', function () {

        it('successfully creates hash from package dependencies', function (done) {

            var pkg = {
                devDependencies: {
                    'expect.js': '^0.3.1',
                    'mini-mock': '^0.0.3',
                    mocha: '^3.2.0'
                },
                dependencies: {
                    archiver: '^1.3.0',
                    async: '^2.3.0',
                    bluebird: '^3.5.0',
                    chalk: '^1.1.3',
                    'cross-spawn': '^5.1.0',
                    dockerode: '^2.4.3',
                    events: '^1.1.1',
                    'fast-diff': '^1.1.1',
                    figures: '^2.0.0',
                    'happner-serial-mocha': 'git+https://github.com/happner/happner-serial-mocha.git',
                    'log-update': '^2.0.0',
                    'node-cmd': '^3.0.0',
                    'simple-git': '^1.70.0',
                    'stable-node-version': '^1.0.0',
                    'test-metrics': 'git+https://github.com/happner/test-metrics.git',
                    'text-table': '^0.2.0'
                }
            };

            var Hasher = require('../../../lib/utils/package-hasher');
            var hasher = new Hasher();

            var result = hasher.createPackageHash(pkg);

            expect(result).to.be(1556671475);

            done();
        });
    });
});
