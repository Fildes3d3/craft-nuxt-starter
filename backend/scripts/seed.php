<?php
/**
 * Demo content seeder — run via `make setup` (or directly:
 * `docker compose exec php-fpm php /app/backend/scripts/seed.php`).
 *
 * Idempotent: skips anything that already exists.
 */

use craft\elements\Entry;

define('CRAFT_BASE_PATH', dirname(__DIR__));
define('CRAFT_VENDOR_PATH', CRAFT_BASE_PATH . '/vendor');

require_once CRAFT_VENDOR_PATH . '/autoload.php';

if (class_exists(Dotenv\Dotenv::class)) {
    Dotenv\Dotenv::createUnsafeMutable(CRAFT_BASE_PATH)->safeLoad();
}

/** @var craft\console\Application $app */
$app = require CRAFT_VENDOR_PATH . '/craftcms/cms/bootstrap/console.php';

$hasFailures = false;

function out(string $msg): void
{
    echo "  $msg\n";
}

function fail(string $msg): void
{
    global $hasFailures;
    $hasFailures = true;
    out($msg);
}

$entriesService = Craft::$app->getEntries();
$elements       = Craft::$app->getElements();

// ── 1. Home single — fill with blocks if empty ──────────────────────────────
$home = Entry::find()->section('home')->status(null)->one();

if ($home === null) {
    out('✗ Home entry not found — has project config been applied?');
    exit(1);
}

if ($home->getFieldValue('contentBlocks')->count() === 0) {
    $home->setFieldValue('contentBlocks', [
        'new1' => [
            'type'    => 'heroBlock',
            'enabled' => true,
            'fields'  => [
                'heading' => 'Craft CMS 5 + Nuxt 4, already wired together.',
                'text'    => 'A headless starter with GraphQL, live preview, and Docker — everything talks to everything, so you can skip the plumbing and start building.',
            ],
        ],
        'new2' => [
            'type'    => 'textBlock',
            'enabled' => true,
            'fields'  => [
                'body' => '<h2>How this works</h2><p>This page is a <strong>Home</strong> single entry in Craft, built from matrix content blocks and fetched over GraphQL by a Nuxt 4 server-rendered route.</p><p>Open the <a href="http://localhost/admin">Craft control panel</a>, edit the Home entry, hit save — then refresh this page. That round trip is the whole development loop.</p><h2>What\'s inside</h2><ul><li>Craft CMS 5 in headless mode with the GraphQL API enabled</li><li>Nuxt 4 with SSR, typed queries, and a tiny GraphQL client</li><li>Live preview wired up — drafts render in the preview pane</li><li>A Pages structure and a Blog channel to grow from</li></ul>',
            ],
        ],
    ]);

    if ($elements->saveElement($home)) {
        out('✓ Home entry seeded with demo blocks');
    } else {
        fail('✗ Home save failed: ' . json_encode($home->getErrors()));
    }
} else {
    out('• Home entry already has content — skipping');
}

// ── 2. "About" page in the Pages structure ──────────────────────────────────
$about = Entry::find()->section('pages')->slug('about')->status(null)->one();

if ($about === null) {
    $pagesSection = $entriesService->getSectionByHandle('pages');

    if ($pagesSection === null) {
        out('✗ Pages section not found — has project config been applied?');
        exit(1);
    }

    $pageType = $pagesSection->getEntryTypes()[0];

    $about            = new Entry();
    $about->sectionId = $pagesSection->id;
    $about->typeId    = $pageType->id;
    $about->title     = 'About';
    $about->slug      = 'about';

    $about->setFieldValue('contentBlocks', [
        'new1' => [
            'type'    => 'heroBlock',
            'enabled' => true,
            'fields'  => [
                'heading' => 'About this starter',
                'text'    => 'This page lives in the Pages structure — add as many as you need.',
            ],
        ],
        'new2' => [
            'type'    => 'textBlock',
            'enabled' => true,
            'fields'  => [
                'body' => '<p>Pages in the <strong>Pages</strong> section are routed by slug: this entry\'s slug is <code>about</code>, so it renders at <code>/about</code> via Nuxt\'s <code>[slug].vue</code> route.</p><p>Create a new page in the control panel and it\'s instantly reachable — no frontend changes needed.</p>',
            ],
        ],
    ]);

    if ($elements->saveElement($about)) {
        out('✓ About page created');
    } else {
        fail('✗ About save failed: ' . json_encode($about->getErrors()));
    }
} else {
    out('• About page already exists — skipping');
}

// ── 3. Two blog posts ────────────────────────────────────────────────────────
$posts = [
    [
        'title'   => 'Hello from Craft',
        'date'    => '-2 days',
        'slug'    => 'hello-from-craft',
        'excerpt' => 'The obligatory first post — and proof the Blog channel works end to end.',
        'body'    => '<p>This post is an entry in the <strong>Blog</strong> channel. The listing at <code>/blog</code> and this detail page are both Nuxt routes querying Craft over GraphQL.</p><p>Posts are ordered by post date, support an excerpt and a featured image, and the body you\'re reading is a CKEditor rich text field.</p>',
    ],
    [
        'title'   => 'Why headless Craft + Nuxt',
        'date'    => '-1 day',
        'slug'    => 'why-headless-craft-nuxt',
        'excerpt' => 'Editors get a CMS they actually like. Developers get a modern frontend. Nobody compromises.',
        'body'    => '<p>Craft\'s content modelling is best-in-class: sections, matrix fields, live preview, granular permissions. Nuxt brings SSR, file-based routing, and the Vue ecosystem.</p><p>The seam between them is a single GraphQL endpoint — which means the frontend and backend can evolve independently, and either one can be swapped out later without rewriting the other.</p>',
    ],
];

$blogSection = $entriesService->getSectionByHandle('blog');

if ($blogSection === null) {
    out('✗ Blog section not found — has project config been applied?');
    exit(1);
}

$postType = $blogSection->getEntryTypes()[0];

foreach ($posts as $data) {
    $existing = Entry::find()->section('blog')->slug($data['slug'])->status(null)->one();

    if ($existing !== null) {
        out("• Post '{$data['slug']}' already exists — skipping");
        continue;
    }

    $post            = new Entry();
    $post->sectionId = $blogSection->id;
    $post->typeId    = $postType->id;
    $post->title     = $data['title'];
    $post->slug      = $data['slug'];
    $post->postDate  = new DateTime($data['date']);

    $post->setFieldValue('excerpt', $data['excerpt']);
    $post->setFieldValue('body', $data['body']);

    if ($elements->saveElement($post)) {
        out("✓ Post '{$data['slug']}' created");
    } else {
        fail("✗ Post '{$data['slug']}' failed: " . json_encode($post->getErrors()));
    }
}

if ($hasFailures) {
    out('Seed finished with failures.');
    exit(1);
}

out('Seed complete.');
