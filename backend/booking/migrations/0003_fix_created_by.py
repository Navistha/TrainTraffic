"""Idempotent migration to ensure `created_by` exists on Freight.

This migration checks for the presence of the `created_by_id` column and
only adds the field when it is missing. That avoids DuplicateColumn errors
when the database schema already contains the column but the migration
history was not recorded.

This targets PostgreSQL (uses information_schema). If you use a different
database, let me know and I'll adapt.
"""

from django.db import migrations, models, connection
from django.conf import settings


def add_created_by_if_missing(apps, schema_editor):
    Freight = apps.get_model('booking', 'Freight')
    table_name = Freight._meta.db_table
    column_name = 'created_by_id'

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT 1 FROM information_schema.columns WHERE table_name = %s AND column_name = %s",
            [table_name, column_name],
        )
        exists = cursor.fetchone() is not None

    if exists:
        # Column already exists, nothing to do
        return

    # Create a new ForeignKey field instance referencing the AUTH_USER_MODEL
    fk = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    fk.concrete = True
    fk.many_to_many = False
    fk.remote_field = fk.remote_field
    # Set the name which add_field expects
    fk.set_attributes_from_name('created_by')

    schema_editor.add_field(Freight, fk)


def remove_created_by_if_exists(apps, schema_editor):
    Freight = apps.get_model('booking', 'Freight')
    table_name = Freight._meta.db_table
    column_name = 'created_by_id'

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT 1 FROM information_schema.columns WHERE table_name = %s AND column_name = %s",
            [table_name, column_name],
        )
        exists = cursor.fetchone() is not None

    if not exists:
        return

    # Remove the field if present
    field = Freight._meta.get_field('created_by')
    schema_editor.remove_field(Freight, field)


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(add_created_by_if_missing,
                             remove_created_by_if_exists),
    ]
