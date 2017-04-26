/*
 { id: '1493203392599_46632f14-4e4c-4330-a949-0871d5838f43',
 message:
 { repo: 'happner/happn-protocol',
 event:
 { type: 'push',
 name: 'happn-protocol',
 owner: 'happner',
 branch: 'master' },
 config:
 { owner: 'happner',
 name: 'happn-protocol',
 node_js: [Object],
 job_type: 'happn-protocol',
 events: [Object] },
 job_type:
 { name: 'happn-protocol',
 path: '/Users/grant/Projects/Tenacious/NSoft/tracey/lib/job_types/happn-protocol/runner' },
 folder: '/Users/grant/Projects/Tenacious/NSoft/tracey/tracey_job_folder/happner/happn-protocol/1493203392599_46632f14-4e4c-4330-a949-0871d5838f43' } }
 */

var expect = require('expect.js');
var path = require('path');

var JobParser = require('../../../lib/parsers/job-parser');

describe('unit - happn-protocol job-runner', function () {

    this.timeout(30000);

    context('', function () {

        beforeEach('setup', function (done) {

            this.__parser = new JobParser();
            done();
        });

        afterEach('stop', function (done) {
            done();
        });

        context('job-parser', function () {

            it('successfully parses', function (done) {

                var mockJob = {
                    id: '1493203392599_46632f14-4e4c-4330-a949-0871d5838f43',
                    message: {
                        repo: 'happner/happn-protocol',
                        event: {
                            type: 'push',
                            name: 'happn-protocol',
                            owner: 'happner',
                            branch: 'master'
                        },
                        config: {
                            owner: 'happner',
                            name: 'happn-protocol',
                            node_js: {},
                            job_type: 'happn-protocol',
                            events: {}
                        },
                        job_type: {
                            name: 'happn-protocol',
                            path: '/Users/grant/Projects/Tenacious/NSoft/tracey/lib/job_types/happn-protocol/runner'
                        },
                        folder: '/Users/grant/Projects/Tenacious/NSoft/tracey/tracey_job_folder/happner/happn-protocol/1493203392599_46632f14-4e4c-4330-a949-0871d5838f43'
                    }
                };

                var result = this.__parser.parseJob(mockJob);

                expect(result.folder).to.be('/Users/grant/Projects/Tenacious/NSoft/tracey/tracey_job_folder/happner/happn-protocol/1493203392599_46632f14-4e4c-4330-a949-0871d5838f43')

                done();
            });

        });
    });
});
