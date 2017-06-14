#!/usr/bin/env/python

"""
https://gist.github.com/wrunk/1317933
"""

import os
import sys
import time
import logging
import markdown

from jinja2 import Environment, FileSystemLoader
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

def build():
    # Create the jinja2 environment.
    # Notice the use of trim_blocks, which greatly helps control whitespace.
    j2_env = Environment(
        loader=FileSystemLoader(TEMPLATE_DIR),
        trim_blocks=True
    )

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
    write_html(j2_env, "index.j2", "index.html", **ctx_common, **ctx_english)

    write_html(j2_env, "press.j2", "press/index.html",
        **ctx_common, **ctx_english,
        press_html=md_file_to_html(os.path.join(CONTENT_DIR, "press_en.md")),
        game_info_html=game_info,
        locale="en",
        game_info_title="Game Assets",
    )

    # korean
    write_html(j2_env, "index.j2", "ko/index.html", **ctx_common, **ctx_korean)

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


