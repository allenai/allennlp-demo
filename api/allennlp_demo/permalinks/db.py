"""
Database utilities for the service
"""
from typing import Optional, List, Dict
import json
import datetime
import logging
import os

import psycopg2

from allennlp_demo.permalinks.models import PermaLink

logger = logging.getLogger(__name__)  # pylint: disable=invalid-name


class DemoDatabase:
    """
    This class represents a database backing the demo server.
    Currently it is used to store predictions, in order to enable permalinks.
    In the future it could also be used to store user-submitted feedback about predictions.
    """

    def insert_request(
        self,
        request_data: Dict,
        model_name: Optional[str] = None,
        model_id: Optional[str] = None,
        task_name: Optional[str] = None,
    ) -> Optional[int]:
        """
        Add the request to the database so that it can later
        be retrieved via permalink.
        """
        raise NotImplementedError

    def get_result(self, perma_id: int) -> PermaLink:
        """
        Gets the result from the database with the given id.
        Returns ``None`` if no such result.
        """
        raise NotImplementedError

    @classmethod
    def from_environment(cls) -> Optional["DemoDatabase"]:
        """
        Instantiate a database using parameters (host, port, user, password, etc...) from environment variables.
        """
        raise NotImplementedError


# SQL for inserting requests into the database.
INSERT_SQL = """
        INSERT INTO queries (model_name, request_data, timestamp, model_id, task_name)
        VALUES (%(model_name)s, %(request_data)s, %(timestamp)s, %(model_id)s, %(task_name)s)
        RETURNING id
        """

# SQL for retrieving a prediction from the database.
RETRIEVE_SQL = """
        SELECT model_name, request_data, model_id, task_name
        FROM queries
        WHERE id = (%s)
        """


class PostgresDemoDatabase(DemoDatabase):
    """
    Concrete Postgres implementation.
    """

    def __init__(self, dbname: str, host: str, port: str, user: str, password: str) -> None:
        self.dbname = dbname
        self.host = host
        self.port = port
        self.user = user
        self.password = password

    def connect(self) -> psycopg2.extensions.connection:
        logger.info("establishing database connection:")
        logger.info("host: %s", self.host)
        logger.info("port: %s", self.port)
        logger.info("dbname: %s", self.dbname)
        conn = psycopg2.connect(
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password,
            dbname=self.dbname,
            connect_timeout=5,
        )
        conn.set_session(autocommit=True)
        return conn

    @classmethod
    def from_environment(cls) -> Optional["PostgresDemoDatabase"]:
        host = os.environ.get("DEMO_POSTGRES_HOST")
        port = os.environ.get("DEMO_POSTGRES_PORT") or "5432"
        dbname = os.environ.get("DEMO_POSTGRES_DBNAME")
        user = os.environ.get("DEMO_POSTGRES_USER")
        password = os.environ.get("DEMO_POSTGRES_PASSWORD")

        # Don't check for the password to allow for password-less access while developing locally.
        if all([host, port, dbname, user]):
            try:
                logger.info("Initializing demo database connection using environment variables")
                return PostgresDemoDatabase(
                    dbname=dbname, host=host, port=port, user=user, password=password
                )
            except psycopg2.Error:
                logger.exception("unable to connect to database, permalinks not enabled")
                return None
        else:
            logger.info("Relevant environment variables not found, so no demo database")
            return None

    def insert_request(
        self,
        request_data: Dict,
        model_name: Optional[str] = None,
        model_id: Optional[str] = None,
        task_name: Optional[str] = None,
    ) -> Optional[int]:
        conn = self.connect()
        try:
            with conn.cursor() as curs:
                logger.info("inserting into the database")

                curs.execute(
                    INSERT_SQL,
                    {
                        "model_name": model_name,
                        "request_data": json.dumps(request_data),
                        "timestamp": datetime.datetime.now(),
                        "model_id": model_id,
                        "task_name": task_name,
                    },
                )

                perma_id = curs.fetchone()[0]
                logger.info("received perma_id %s", perma_id)

            return perma_id
        except (psycopg2.Error, AttributeError):
            logger.exception("Unable to insert permadata")
            return None
        finally:
            conn.close()

    def get_result(self, perma_id: int) -> Optional[PermaLink]:
        conn = self.connect()
        try:
            with conn.cursor() as curs:
                logger.info("retrieving perma_id %s from database", perma_id)
                curs.execute(RETRIEVE_SQL, (perma_id,))
                row = curs.fetchone()

            # If there's no result, return None.
            if row is None:
                return None

            # Otherwise, return a ``PermaLink`` instance.
            model_name, request_data, model_id, task_name = row
            return PermaLink(model_name, json.loads(request_data), model_id, task_name)
        except (psycopg2.Error, AttributeError):
            logger.exception("Unable to retrieve result")
            return None
        finally:
            conn.close()


class InMemoryDemoDatabase(DemoDatabase):
    """
    This is just for unit tests, please don't use it in production.
    """

    def __init__(self):
        self.data: List[PermaLink] = []

    def insert_request(
        self,
        request_data: Dict,
        model_name: Optional[str] = None,
        model_id: Optional[str] = None,
        task_name: Optional[str] = None,
    ) -> Optional[int]:
        self.data.append(PermaLink(model_name, request_data, model_id, task_name))
        return len(self.data) - 1

    def get_result(self, perma_id: int) -> Optional[PermaLink]:
        try:
            return self.data[perma_id]
        except IndexError:
            return None

    @classmethod
    def from_environment(cls) -> Optional["InMemoryDemoDatabase"]:
        return InMemoryDemoDatabase()
