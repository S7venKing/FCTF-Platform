"""add column

Revision ID: d80520db88f6
Revises: 66f438637939
Create Date: 2024-10-24 16:07:48.297056

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'd80520db88f6'
down_revision = '66f438637939'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('deploy_histories',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('challenge_id', sa.Integer(), nullable=False),
    sa.Column('log_content', sa.Text(), nullable=True),
    sa.Column('deploy_status', sa.String(length=50), nullable=False),
    sa.Column('deploy_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['challenge_id'], ['challenges.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('deploy_challenge')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('deploy_challenge',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('challenge_id', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('deploy_state', mysql.VARCHAR(length=255), nullable=False),
    sa.Column('image_name', mysql.VARCHAR(length=255), nullable=True),
    sa.Column('last_update', mysql.DATETIME(fsp=6), nullable=False),
    sa.Column('deployment_name', mysql.VARCHAR(length=255), nullable=True),
    sa.Column('user_id', mysql.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('log_content', mysql.TEXT(), nullable=True),
    sa.ForeignKeyConstraint(['challenge_id'], ['challenges.id'], name='deploy_challenge_ibfk_1'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='deploy_challenge_ibfk_2'),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_0900_ai_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.drop_table('deploy_histories')
    # ### end Alembic commands ###
