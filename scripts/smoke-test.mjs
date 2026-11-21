/* Clippy Reborn — smoke test.
   Offline checks: lib.js pure helpers. Live probes: Pollinations text
   API (keyless, same call shape as the app). Run: node scripts/smoke-test.mjs
   Usage: node scripts/smoke-test.mjs [--offline-only]
   Exit code 0 = all checks pass. */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lib = require(join(root, 'lib.js'));

const offlineOnly = process.argv.includes('--offline-only');
let pass = 0;
let fail = 0;
const results = [];

function check(name, cond, detail) {
  if (cond) { pass++; results.push('PASS  ' + name); }
  else { fail++; results.push('FAIL  ' + name + (detail ? ' — ' + detail : '')); }
}

function eq(name, got, want) {
  check(name, JSON.stringify(got) === JSON.stringify(want),
    'got ' + JSON.stringify(got) + ', want ' + JSON.stringify(want));
}

/* --- offline: word count / truncate / sentences --- */
eq('wordCount empty', lib.wordCount(''), 0);
eq('wordCount basic', lib.wordCount('  one  two three\nfour '), 4);
eq('truncate short', lib.truncate('hello', 10), 'hello');
check('truncate long', lib.truncate('one two three four five', 12).length <= 13);
eq('splitSentences', lib.splitSentences('Hello world. How are you? Fine!'),
  ['Hello world.', 'How are you?', 'Fine!']);

/* --- offline: local summary --- */
const sample = 'Dear Hiring Manager, I am writing to apply for the product designer role at Northwind Studio. I have spent six years designing tools that people use every day. In my current role I rebuilt our onboarding flow from scratch and cut the time to first value in half.';
const summary = lib.localSummarize(sample, 2);
check('localSummarize returns 2 sentences', lib.splitSentences(summary).length === 2, summary);
check('localSummarize keeps first sentence', summary.startsWith('Dear Hiring Manager,'));

/* --- offline: local grammar fix --- */
const fixed = lib.localGrammarFix('this is teh test.  it has the the problem and i like it.');
check('localGrammarFix finds fixes', fixed !== null && fixed.fixes >= 3, JSON.stringify(fixed));
check('localGrammarFix fixes teh', fixed && fixed.text.includes('the test'));
check('localGrammarFix fixes repeated word', fixed && !/the the/.test(fixed.text));
check('localGrammarFix capitalizes sentence', fixed && fixed.text.startsWith('This is'));
check('localGrammarFix clean text returns null',
  lib.localGrammarFix('This is clean. It reads well.') === null);

/* --- offline: paragraphs / offsets --- */
const paras = lib.paragraphs('First para.\n\nSecond para here.\n\nThird.');
eq('paragraphs count', paras.length, 3);
eq('paragraphs first text', paras[0].text, 'First para.');
const at = lib.paragraphAtOffset('First para.\n\nSecond para here.\n\nThird.', 16);
check('paragraphAtOffset finds second', at && at.text === 'Second para here.', JSON.stringify(at));
const longest = lib.longestParagraph('Short.\n\nThis one is the longest paragraph by far, with many more words than the others.\n\nMid.');
check('longestParagraph', longest && longest.text.startsWith('This one is'), JSON.stringify(longest));

/* --- offline: word diff --- */
const d1 = lib.wordDiff('the quick brown fox', 'the quick red fox jumps');
eq('wordDiff tokens', d1.map(t => t.type + ':' + t.text),
  ['same:the quick', 'del:brown', 'add:red', 'same:fox', 'add:jumps']);
const d2 = lib.wordDiff('', 'hello world');
eq('wordDiff add-only', d2, [{ type: 'add', text: 'hello world' }]);
const d3 = lib.wordDiff('hello world', 'hello world');
eq('wordDiff identical', d3, [{ type: 'same', text: 'hello world' }]);
const html = lib.renderDiffHtml(lib.wordDiff('keep this', 'keep that'));
check('renderDiffHtml escapes + marks',
  html.includes('diff-del') && html.includes('diff-ins') && html.includes('keep'));

/* --- offline: no secrets in shipped files --- */
const shipped = ['index.html', 'styles.css', 'app.js', 'lib.js', 'preview-pip.html', 'README.md'];
const secretRe = /(api[_-]?key|apikey|secret|password|bearer|sk-[A-Za-z0-9]{8,})[\s"':=]/i;
for (const f of shipped) {
  const content = readFileSync(join(root, f), 'utf8');
  check('secret scan ' + f, !secretRe.test(content));
}

/* --- offline: .gitignore must not ignore .kiro --- */
const gitignore = readFileSync(join(root, '.gitignore'), 'utf8');
check('.gitignore keeps .kiro', !/^\s*\.kiro\/?\s*$/m.test(gitignore) && !/^\s*\.kiro\//m.test(gitignore));

/* --- live probes (skipped with --offline-only) --- */
async function liveProbe(name, url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs || 30000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const text = (await res.text()).trim();
    check(name, res.ok && text.length > 0, 'status ' + res.status);
    return text;
  } catch (e) {
    check(name, false, String(e && e.name || e));
    return null;
  } finally {
    clearTimeout(timer);
  }
}

if (!offlineOnly) {
  await liveProbe('Pollinations text (hello)',
    'https://text.pollinations.ai/Say%20hello%20in%20one%20short%20sentence');
  const sum = await liveProbe('Pollinations text (summarize)',
    'https://text.pollinations.ai/' + encodeURIComponent(
      'Summarize the following text in one plain sentence. Reply with only the summary, no preamble:\n\nThe quick brown fox jumps over the lazy dog near the riverbank while the sun sets.'));
  if (sum) console.log('      summarize probe reply: ' + sum.slice(0, 120));
}

console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
