import { expect } from 'chai';
import * as sinon from 'sinon';
import { GitRepository } from '../../git/repository';
import { FileUtils } from '../../utils/file';

describe('GitRepository', () => {
  let gitMock: any;
  let existsStub: sinon.SinonStub;

  beforeEach(() => {
    gitMock = {
      status: sinon.stub().resolves({
        behind: 0,
        isClean: () => true,
        modified: [],
        created: [],
        not_added: []
      }),
      revparse: sinon.stub().resolves('main'),
      log: sinon.stub().resolves({
        latest: { hash: '1234567', date: new Date().toISOString() },
        all: []
      }),
      pull: sinon.stub().resolves({
        summary: { changes: 0 }
      })
    };
    existsStub = sinon.stub(FileUtils, 'exists').resolves(true);
  });

  afterEach(() => {
    existsStub.restore();
  });

  it('should get status correctly', async () => {
    const repo = new GitRepository('/fake/path', undefined, gitMock as any);

    const status = await repo.getStatus();

    expect(status.exists).to.be.true;
    expect(status.currentBranch).to.equal('main');
    expect(status.isUpToDate).to.be.true;
  });

  it('should handle pull with no changes', async () => {
    const repo = new GitRepository('/fake/path', undefined, gitMock as any);
    const result = await repo.pull();

    expect(result.updated).to.be.false;
    expect(result.message).to.contain('已是最新版本');
  });

  it('should handle pull with changes', async () => {
    gitMock.pull.resolves({
      summary: { changes: 5 }
    });
    const repo = new GitRepository('/fake/path', undefined, gitMock as any);
    const result = await repo.pull();

    expect(result.updated).to.be.true;
    expect(result.message).to.contain('已更新到最新版本');
    expect(result.message).to.contain('5 个文件变更');
  });
});
