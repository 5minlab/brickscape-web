#!/usr/bin/env/python

"""
https://gist.github.com/wrunk/1317933
"""

import os
import sys
import re
import time
import logging
import markdown

from jinja2 import Environment, FileSystemLoader, escape, Markup, evalcontextfilter
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Capture our current directory
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(THIS_DIR, "templates")
CONTENT_DIR = os.path.join(THIS_DIR, "contents")
OUTPUT_DIR = os.path.join(THIS_DIR, "docs")

def md_file_to_html(filepath):
    src = open(filepath, encoding="utf-8").read()
    return markdown.markdown(src, extensions=['markdown.extensions.tables'])

@evalcontextfilter
def nl2br(eval_ctx, value):
    return value.replace('\n', '<br/>')

def build():
    # Create the jinja2 environment.
    # Notice the use of trim_blocks, which greatly helps control whitespace.
    j2_env = Environment(
        loader=FileSystemLoader(TEMPLATE_DIR),
        trim_blocks=True
    )
    j2_env.filters['nl2br'] = nl2br

    ctx_common = {
        "timestamp": int(time.time()),
    }
    ctx_english = {
        "root_link" : "/",
        "press_link" : "/press/",
    }
    ctx_korean = {
        "root_link" :"/ko/",
        "press_link" :"/ko/press/",
    }

    game_info = md_file_to_html(os.path.join(CONTENT_DIR, "game_info.md"))

    # english
    write_html(j2_env, "index.j2", "index.html",
        **ctx_common, **ctx_english,
        short_desc="""Addictive 3D puzzle to wake up your brain
Move bricks to take out the Core Brick""",
        how_to_play="How to play",
        how_to_play_content="""Move Core Brick to the exit.
Every brick has to be moved in an elongated direction.
You can't move bricks out of the box.""",
        feature="Features",
        feature_list=[
            "Meet more than <b>600 brain teasing stages</b> in 12 aesthetic themes.",
            "<b>Simple and easy</b> play for everyone.",
            "5 difficulty levels; from easy to master.",
            "<b>Choose your favorite level</b>: You don't need to clear them in order.",
            "<b>Daily Puzzle Mode</b>: Compete with other players around the world.",
            "Unlike other puzzle games, <b>there is no time limit</b>.",
            "Enjoy our <b>brilliant and unique brick texture and sound design</b>.",
            "<b/>Ask for 'Hint'</b> when needed, and use <b>'Undo'</b> feature to correct mistakes.",
            "<b>No Internet connection required</b> to play.",
        ],
        play_message="""Play Brickscape now
on your phones and tablets!""",
    )

    write_html(j2_env, "press.j2", "press/index.html",
        **ctx_common, **ctx_english,
        press_html=md_file_to_html(os.path.join(CONTENT_DIR, "press_en.md")),
        game_info_html=game_info,
        locale="en",
        game_info_title="Game Assets",
    )

    # korean
    write_html(j2_env, "index.j2", "ko/index.html",
        **ctx_common, **ctx_korean,
        short_desc="""잠자는 당신의 뇌세포를 깨울 중독성 있는 3D 퍼즐 게임
퍼즐을 돌리고 브릭을 움직여서,
갇혀있는 '코어 브릭'을 꺼내주세요!""",
        how_to_play="게임 방법",
        how_to_play_content="""코어 브릭을 탈출구까지 옮겨주세요.
모든 브릭은 길쭉한 방향으로만 움직일 수 있습니다.
브릭을 퍼즐 밖으로는 움직일 수 없습니다.""",
        feature="게임 특징",
        feature_list=[
            "당신의 뇌를 자극할 12개의 테마, 600개 이상의 퍼즐을 만나 보세요.",
            "드래그하는 간단한 동작만으로 퍼즐을 풀 수 있습니다.",
            "쉬움부터 마스터까지 5가지 수준의 난이도를 플레이해 보세요.",
            "마음에 드는 퍼즐부터 시작해 보세요. 처음부터 하나씩 순서대로 클리어할 필요가 없습니다.",
            "매일 갱신되는 퍼즐로 전세계 사람들과 경쟁해 보세요.",
            "시간 제한이 없습니다. 자신의 스타일대로 풀어나가세요.",
            "각자의 매력이 있는 다양한 브릭 디자인과 고유의 효과음으로 환상적인 퍼즐을 만끽하세요.",
            "힌트로 어려운 순간에 도움을 받고, 언두로 실수를 바로잡아 보세요.",
            "오프라인 환경에서도 언제든 퍼즐을 풀 수 있습니다.",
        ],
        play_message="""지금 브릭스케이프를 휴대폰과 태블릿으로 플레이하세요!""",
    )

    write_html(j2_env, "press.j2", "press/index.html",
        **ctx_common, **ctx_english,
        press_html=md_file_to_html(os.path.join(CONTENT_DIR, "press_en.md")),
        game_info_html=game_info,
        locale="en",
        game_info_title="Game Assets",
    )

    write_html(j2_env, "press.j2", "ko/press/index.html",
        **ctx_common, **ctx_korean,
        press_html=md_file_to_html(os.path.join(CONTENT_DIR, "press_ko.md")),
        game_info_html=game_info,
        locale="ko",
        game_info_title="게임 자료",
    )

    print("rebuild site")

def write_html(env, template_file, output_file, **kwargs):
    html = env.get_template(template_file).render(**kwargs)
    output_filepath = os.path.join(OUTPUT_DIR, output_file)
    output_path = os.path.dirname(output_filepath)
    try:
        os.makedirs(output_path, exist_ok=True)
    except OSError:
        pass

    open(output_filepath, mode="w", encoding="utf-8").write(html)


class BuildEventHandler(FileSystemEventHandler):
    """Logs all the events captured."""

    def on_moved(self, event):
        super(BuildEventHandler, self).on_moved(event)

        what = 'directory' if event.is_directory else 'file'
        logging.info("Moved %s: from %s to %s", what, event.src_path,
                     event.dest_path)
        build()

    def on_created(self, event):
        super(BuildEventHandler, self).on_created(event)

        what = 'directory' if event.is_directory else 'file'
        logging.info("Created %s: %s", what, event.src_path)
        build()

    def on_deleted(self, event):
        super(BuildEventHandler, self).on_deleted(event)

        what = 'directory' if event.is_directory else 'file'
        logging.info("Deleted %s: %s", what, event.src_path)
        build()

    def on_modified(self, event):
        super(BuildEventHandler, self).on_modified(event)

        what = 'directory' if event.is_directory else 'file'
        logging.info("Modified %s: %s", what, event.src_path)
        build()


if __name__ == '__main__':
    build()
    print("build one time")

    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s - %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S')
    event_handler = BuildEventHandler()
    observer = Observer()
    observer.schedule(event_handler, TEMPLATE_DIR, recursive=True)
    observer.schedule(event_handler, CONTENT_DIR, recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


